const moment = require('moment');
const cronParser = require('cron-parser');

function markAs(schedule, status, node, requestedSendTime) {
  const actualTime = moment().toISOString();
  const id = schedule._id.toString();
  schedule.status = status;
  schedule.node = node;
  console.log({ id, status, requestedSendTime, actualTime, node, cron: schedule.cron });
}

function reduceRemainingRuns(schedule) {
  if (schedule.endAfter) {
    schedule.endAfter -= 1;
    return schedule.endAfter;
  }
}

function scheduleHasExpired(schedule) {
  if (schedule.endAfter === 0) {
    return true;
  }

  if (schedule.endOn) {
    const endOnDate = moment(schedule.endOn);
    const today = moment();
    if (endOnDate.isSame(today) === true) {
      return true;
    }
  }

  return false;
}

function calculateNextSendTime(schedule) {
  const nextTimeGenerator = cronParser.parseExpression(schedule.cron);

  let nextSendTime;
  do {
    nextSendTime = nextTimeGenerator.next()
  } while (nextSendTime.toISOString() === schedule.next.toISOString());

  return nextSendTime;
}

function calculateTimeToWait(schedule) {
  const nextSendTime = moment(schedule.next.toISOString());
  const now = moment();
  const waitTime = moment
    .duration(nextSendTime.diff(now))
    .subtract(1, 'seconds')
    .as('milliseconds');

  return waitTime;
}

module.exports = {
  markAs,
  scheduleHasExpired,
  calculateNextSendTime,
  calculateTimeToWait,
  reduceRemainingRuns,
};