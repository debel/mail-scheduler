const connect = require('../services/mongo');

async function getNextBatch({ limit = 10, skip = 0, force = false } = {}) {
  const client = await connect();
  const db = client.db('mails');
  const collection = db.collection('mails');

  const cursor = collection.find({}, { limit, skip, sort: [['next', 1], ['last', 1] ]});
  _nextMails = await cursor.toArray();

  return _nextMails;
};

async function setNextRun(id, { last, next }) {
  const client = await connect();

  const db = client.db('mails');
  const collection = db.collection('mails');

  return collection.updateOne(
    { _id: id },
    { $set: { last: last.toDate ? last.toDate() : last, next: next.toDate() }},
  );
}

module.exports = {
  getNextBatch,
  setNextRun,
};
