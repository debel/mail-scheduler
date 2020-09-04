const connect = require('../services/mongo');

async function getNextBatch({ limit = 10, skip = 0, force = false } = {}) {
  const client = await connect();
  const db = client.db('schedules');
  const collection = db.collection('schedules');

  const cursor = collection.find({ next: { $ne: null } }, { limit, skip, sort: [['next', 1], ['last', 1] ]});
  _nextMails = await cursor.toArray();

  return _nextMails;
};

async function updateRuns(schedule, { last, next, endAfter }) {
  const client = await connect();

  const db = client.db('schedules');
  const collection = db.collection('schedules');

  const id = schedule._id;
  const updatedFields = {
    last: last.toDate ? last.toDate() : last,
    next: next && next.toDate(),
  };

  schedule.last = last;
  schedule.next = next;

  if (Number.isInteger(endAfter)) {
    updatedFields.endAfter = endAfter;
  }

  return collection.updateOne(
    { _id: id },
    { $set: updatedFields },
  );
}

module.exports = {
  getNextBatch,
  updateRuns,
};
