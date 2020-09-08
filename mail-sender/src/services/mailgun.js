const { domain, apiKey } = require('../../config/secrets');
const mailgun = require('mailgun-js')({ domain, apiKey });
const cache = require('./redis');

async function sendMail(schedule) {
  return new Promise(async (resolve, reject) => {
    const data = {
      from: schedule.from,
      to: schedule.to,
      subject: schedule.subject,
      text: schedule.body,
    };

    const isSent = await cache.isSent(schedule._id, schedule.next);
    if (!isSent) {
      mailgun.messages().send(data, (error, body) => {
        if (error) { return reject(error); }
        
        cache.markSent(schedule._id, schedule.next);

        resolve(body);
      });
    }
  });
}

module.exports = sendMail;