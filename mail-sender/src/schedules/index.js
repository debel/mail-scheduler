const uuid = require('uuid').v4;
const etcd = require('../services/etcd');
const sendMail = require('../services/mailgun');
const mailSchedule = require('./storage');
const { markAs, calculateNextSendTime, calculateTimeToWait } = require('./utils');

const delay = ms => new Promise(r => setTimeout(r, ms));

const nodeId = uuid();

//TODO:: each failed lock adds to an db read offset i.e. don't get the first it's already being handled
// let alreadyLocked = new Set();

async function handleSchedule(schedule, retryDelay = 1000, retriesLeft = 3) {
  const id = schedule._id.toString();
  const lock = etcd.lock(`schedule::${id}`);
  lock.do(async () => {
    const success = await sendNextMail(schedule);
    if (success) {
      const last = schedule.next;
      const next = calculateNextSendTime(schedule);
      mailSchedule.setNextRun(schedule._id, { last, next });
      schedule.next = next;
      handleSchedule(schedule);
    } else {
      lock.release();
    }
  }).catch(async err => {
    // alreadyLocked.add(id);
    console.error(`${4 - retriesLeft}/3`, err);
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
      const mailingServiceResponse = await sendMail();
      markAs(schedule, 'done', nodeId, sendTimeStr);
      return true;
    } catch (err) {
      markAs(schedule, 'failed', nodeId, sendTimeStr);
      console.error(`${4 - retriesLeft}/3`, `Failed to send ${id} at ${sendTimeStr} due to ${err}`);
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