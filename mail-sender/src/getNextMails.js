const mongodb = require('mongodb').MongoClient;

const connect = require('./utils/mongo');

let _nextMails = [];
async function getNextMails({ limit = 10, force = false } = {}) {
  const client = await connect();
  const db = client.db('mails');
  const collection = db.collection('mails');

  const cursor = collection.find({}, { limit: 10, sort: [['next', 1]]});
  _nextMails = await cursor.toArray();
  return _nextMails;
};

const twoMinutes = 2 * 60 * 1000; 
async function scheduleUpdates(interval = twoMinutes) {
  return getNextMails()
    .then(
      () => setTimeout(() => scheduleUpdates(interval), twoMinutes),
      () => setTimeout(() => scheduleUpdates(interval), twoMinutes),
    );
}

module.exports = {
  getNextMails,
  scheduleUpdates,
  nextMails() { return _nextMails; },
};
