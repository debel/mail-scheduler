const { domain, apiKey } = require('../../config/secrets');
const mailgun = require('mailgun-js')({ domain, apiKey });

async function sendMail(schedule) {
  return new Promise((resolve, reject) => {
    const data = {
      from: schedule.from,
      to: schedule.to,
      subject: schedule.subject,
      text: schedule.body,
    };

    mailgun.messages().send(data, (error, body) => {
      if (error) { return reject(error); }
      
      resolve(body);
    });
  });
}

module.exports = sendMail;