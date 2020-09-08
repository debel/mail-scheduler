const redis = require('redis');
const config = require('../../config');

const client = redis.createClient(config.redisUrl);

async function isSent(id, timestamp) {
  const key = `${id}:${timestamp}`;

  return new Promise((resolve, reject) => 
    client.get(key, (error, reply) => {
      if (error) { return reject(error); }

      resolve(reply === 'sent');
    })
  );
}

const _10_MIN = 10 * 60 * 1000;
async function markSent(id, timestamp) {
  const key = `${id}:${timestamp}`;
  
  return new Promise((resolve, reject) =>
    client.setex(key, _10_MIN, "sent", (error, reply) => {
      if (error) { return reject(error); }

      resolve(reply);
    }));
}

module.exports = {
  isSent,
  markSent,
};