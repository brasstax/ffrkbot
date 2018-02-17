const {Command} = require('discord.js-commando');
const path = require('path');
botPath = path.join(
  __dirname, '..', '..', 'utilities', 'soulbreak-bot-utils.js');
const botUtils = require(botPath);

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'dsb',
      group: 'ffrk',
      memberName: 'dsb',
      description: 'Looks up the default soulbreak for a given character.',
      examples: ['dsb Squall', 'dsb Zell 1', 'dsb \'onion knight\' 2'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
      ],
      aliases: ['default'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName} = args;
    return botUtils.soulbreak(msg, characterName, 'Default')
      .catch( (err) => {
        console.log(`Error calling dsbLookup: ${err}`);
      });
  };
};
