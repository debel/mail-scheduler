const delay = ms => new Promise(r => setTimeout(r, ms));

async function sendMail() {
  const rand = Math.random() * 2000;
  
  await delay(rand);

  if (rand > 1500) {
    throw new Error('mail didnt send');
  }
}

module.exports = sendMail;