const moment = require('moment');
const mongodb = require('mongodb').MongoClient;
const cronParser = require('cron-parser');

const dbUrl = 'mongodb://localhost:27017';

mongodb.connect(dbUrl, (err, client) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const db = client.db('mails');
  const collection = db.collection('mails');
  
  const every_minute = '* * * * *';
  const every_five_minutes = '*/5 * * * *';
  const every_day_at_five_thirty = '30 17 * * *';
  const monday_morning_at_nine = '0 9 * * 1';

  const last = new Date();
  const sampleMails = [
    {
      from: 'zdravko@test.com',
      to: 'nezabravko@test.com',
      subject: 'bla bla bla',
      body: 'lorem ipsum',
      cron: every_minute,
      next: cronParser.parseExpression(every_minute).next().toDate(),
      last,
    },
    {
      from: 'boro@test.com',
      to: 'voro@test.com',
      subject: 'koro',
      body: '4a 4a 4a',
      cron: every_minute,
      next: cronParser.parseExpression(every_minute).next().toDate(),
      last,
    },
    {
      from: 'pesho@test.com',
      to: 'gosho@test.com',
      subject: 'bla bla bla',
      body: 'lorem ipsum',
      cron: every_five_minutes,
      next: cronParser.parseExpression(every_five_minutes).next().toDate(),
      last,
    },
    {
      from: 'gosho@test.com',
      to: 'tosho@test.com',
      subject: '1 2 3',
      body: 'lorem ipsum',
      cron: every_day_at_five_thirty,
      next: cronParser.parseExpression(every_day_at_five_thirty).next().toDate(),
      last,
    },
    {
      from: 'tosho@test.com',
      to: 'pesho@test.com',
      subject: 'a b c',
      body: 'lorem ipsum',
      cron: monday_morning_at_nine,
      next: cronParser.parseExpression(monday_morning_at_nine).next().toDate(),
      last,
    }
  ];

  collection.insertMany(sampleMails).then(console.log, console.error);

  client.close();
});