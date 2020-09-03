const mongodb = require('mongodb').MongoClient;
const config = require('../../config');

let client = null;
module.exports = async function connect() {
  if (client && client.isConnected()) {
    return client;
  }

  try {
    const cli = await mongodb.connect(config.mongoUrl, { useUnifiedTopology: true });
    client = cli;

    //TODO:: schedule close with debounce
    // close the connection after n seconds, but extend timeframe if more requests 

    return client;
  } catch (err) {
    client = null;
    console.error(err);
    process.exit(1);
  }
};
