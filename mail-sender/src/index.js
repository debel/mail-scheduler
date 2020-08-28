const uuid = require('uuid').v4;
const moment = require('moment');
const cronParser = require('cron-parser');
const { subscriber, publisher } = require('./utils/redis');
const { scheduleUpdates, nextMails } = require('./getNextMails');

const nodeId = uuid();

async function sendMail() {
  const rand = Math.random();
  
  if (rand > 2) {
    throw new Error('mail didnt send');
  }
}

function markAs(id, status, node, requestedSendTime) {
  const mails = nextMails().reduce((result, n) => {
    result[n._id] = n; 
    return result;
  }, {});

  const mail = mails[id];
  if (mail) {
    mail.status = status;
    mail.node = node;
    const actualTime = moment().toISOString();
    console.log({ id, requestedSendTime, actualTime, status, node });
  } else {
    // TODO:: handle mail not found
    console.warn(`${id} not found?! on ${nodeId}`);
  }
}

function sendNextMail(mail, requestedSendTime) {
  const id = mail._id.toString();

  publisher.publish('sending', JSON.stringify([nodeId, id, requestedSendTime]));
  sendMail().then(
    () => {
      const nextTickGenerator = cronParser.parseExpression(mail.cron);
      let nextSendTime;
      do {
        nextSendTime = nextTickGenerator.next().toISOString();
      } while (nextSendTime === requestedSendTime);

      mail.next = nextSendTime;
      
      publisher.publish('done', JSON.stringify([nodeId, id, requestedSendTime]));
      markAs(id, 'pending', nodeId, mail.next);
      
      publisher.publish('pending', JSON.stringify([nodeId, id, mail.next]));
      scheduleNextMail(mail);
    },
    () => {
      publisher.publish('failed', JSON.stringify([nodeId, id, requestedSendTime]));
    }
  );
}

const timers = {};
function scheduleNextMail(mail) {
    if (mail.status !== 'pending') {
      return;
    }

    const id = mail._id.toString();

    const sendTime = moment(mail.next);
    const now = moment();
    const waitTime = moment.duration(sendTime.diff(now)).subtract(2, 'seconds').as('milliseconds');

    publisher.publish('scheduled', JSON.stringify([nodeId, id, sendTime.toISOString()]));
    timers[id] = setTimeout(() => sendNextMail(mail, sendTime.toISOString()), waitTime);
}

subscriber.on('message', (action, payload) => {
  const [sender, id, requestedSendTime] = JSON.parse(payload);
  markAs(id, action, sender, requestedSendTime);

  if ((action === 'scheduled' || action === 'sending') && sender !== nodeId && timers[id]) {
    clearTimeout(timers[id]);
  }
});

(async function () {
  await scheduleUpdates();
  scheduleNextMail(nextMails()[0]);
}());