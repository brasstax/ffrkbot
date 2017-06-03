const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

const configFile = fs.readFileSync(configPath);
const config = JSON.parse(configFile);
const token = config.token;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(token);
