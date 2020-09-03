const redis = require('redis');
const config = require('../../config');

const publisher = redis.createClient(config.redisUrl);
const subscriber = redis.createClient(config.redisUrl);

subscriber.subscribe('scheduled', 'sending', 'done', 'failed', 'pending');

module.exports = {
  publisher, subscriber
};