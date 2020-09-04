const uuid = require('uuid').v4;
const etcd = require('../services/etcd');
const sendMail = require('../services/mailgun');
const mailSchedule = require('./storage');
const {
  markAs,
  calculateNextSendTime,
  calculateTimeToWait,
  reduceRemainingRuns,
  scheduleHasExpired
} = require('./utils');

const delay = ms => new Promise(r => setTimeout(r, ms));

const nodeId = uuid();

//TODO:: each failed lock adds to an db read offset i.e. don't get the first it's already being handled
// let alreadyLocked = new Set();

const _5_MIN = 5 * 60 * 1000;
async function handleSchedule(schedule, retryDelay = 1000, retriesLeft = 3) {
  const id = schedule._id.toString();

  const waitTime = calculateTimeToWait(schedule);

  if (waitTime > _5_MIN) {
    return;
  }

  const lock = etcd.lock(`schedule::${id}`);
  lock.do(async () => {
    const success = await sendNextMail(schedule);
    if (success) {
      const endAfter = reduceRemainingRuns(schedule);
      const last = schedule.next;
      const next = scheduleHasExpired(schedule)
        ? null
        : calculateNextSendTime(schedule);

      mailSchedule.updateRuns(schedule, { last, next, endAfter });

      if (next !== null) {
        handleSchedule(schedule);
      }
    } else {
      lock.release();
      throw new Error(`failed to send ${id} ${last}`);
    }
  }).catch(async err => {
    console.error(`${3 - retriesLeft}/3`, err);
    if (retriesLeft > 0) {
      await delay(retryDelay);
      handleSchedule(schedule, retryDelay * 3, retriesLeft - 1);
    }
  });
  return lock;
}

async function sendNextMail(schedule, retryDelay = 1000, retriesLeft = 3) {
    const id = schedule._id.toString();

    const waitTime = calculateTimeToWait(schedule);

    const sendTimeStr = schedule.next.toISOString()
    markAs(schedule, 'scheduled', nodeId, sendTimeStr);

    await delay(waitTime);

    try {
      markAs(schedule, 'sending', nodeId, sendTimeStr);
      const mailingServiceResponse = await sendMail(schedule);
      markAs(schedule, 'done', nodeId, sendTimeStr);
      return true;
    } catch (err) {
      markAs(schedule, 'failed', nodeId, sendTimeStr);
      console.error(`${3 - retriesLeft}/3`, `Failed to send ${id} at ${sendTimeStr} due to ${err}`);
      if (retriesLeft > 0) {
        await delay(retryDelay);
        return sendNextMail(schedule, retryDelay * 3, retriesLeft - 1);
      }
      else {
        return false;
      }
    }  
}

async function scheduleUpdates(ms) {
  try {
    const schedules = await mailSchedule.getNextBatch({ limit: 1, /* skip: alreadyLocked.size */ });
    schedules.forEach(schedule => handleSchedule(schedule));
  } finally {
    await delay(ms);
    scheduleUpdates(ms);
  }
}

module.exports = scheduleUpdates;