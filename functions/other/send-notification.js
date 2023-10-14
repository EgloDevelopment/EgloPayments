const axios = require("axios");

require("dotenv").config();

async function sendDiscordNotification(amount) {
  await axios.post(process.env.DISCORD_WEBHOOK_URL, {
    content: `<@&1162876982778921020> New purchase for ${amount}BTC`,
  });
}

module.exports = { sendDiscordNotification };
