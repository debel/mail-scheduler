const api = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const cronParser = require('cron-parser');

const config = require('../config');
const connect = require('./services/mongo');

api.use(cors());

const NEVER = 'never';
const ONCE = 'once';
const END_ON_DATE = 'end_on_date';
const END_AFTER_X = 'end_after_x';

api.get('/schedules', async (req, res) => {
  const mongo = await connect();
  const db = mongo.db('schedules');
  const collection = db.collection('schedules');

  const cursor = await collection.find({}, { sort: [['next', 1], ['last', 1] ]});
  const data = await cursor.toArray();

  res.json(data);
});

api.post('/schedules', bodyParser.json(), async (req, res) => {
  const mongo = await connect();
  const db = mongo.db('schedules');
  const collection = db.collection('schedules');
  
  const scheduleEndSettings = {};
  if (req.body.recurrence === ONCE) {  
    scheduleEndSettings.endAfter = 1;
  } else if (req.body.endType === END_AFTER_X) {
    scheduleEndSettings.endAfter = req.body.endAfter;
  } else if (req.body.endType === END_ON_DATE) {
    scheduleEndSettings.endOn = req.body.endDate;
  }

  const success = await collection.insertOne({
    from: req.body.from,
    to: req.body.to,
    subject: req.body.subject,
    body: req.body.body,
    cron: req.body.cron,
    next: cronParser.parseExpression(req.body.cron).next().toDate(),
    last: new Date(),
    ...scheduleEndSettings,
  });
  res.sendStatus(201);
});

api.listen(config.port);