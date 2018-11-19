const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

const configFile = fs.readFileSync(configPath);
const config = JSON.parse(configFile);
const token = config.token;

const owner = config.owner;

const client = new Commando.Client({
  owner: owner,
  disableEveryone: true,
  commandPrefix: ',',
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
  client.user.setActivity(',help');
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['ffrk', 'FFRK-related commands'],
    ['newbie', 'Discord.js commando tutorial commands for reference'],
    ['misc', 'Miscellaneous commands'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(token);
