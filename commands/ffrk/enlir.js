const {Command} = require('discord.js-commando');
const path = require('path');
const fs = require('fs');
const configPath = path.join(__dirname, '..', '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath));
const util = require('util');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic reply command.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'enlir',
      group: 'ffrk',
      memberName: 'enlir',
      description: 'Gives the URL for Enlir\'s spreadsheet',
      examples: ['enlir'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @return {Method} msg.say: string
   **/
  run(msg) {
    let enlir = config.enlir_database;
    let spreadsheetFqdn = 'https://docs.google.com/spreadsheets/d/';
    return msg.channel.send(util.format('%s%s/', spreadsheetFqdn, enlir));
  };
};
