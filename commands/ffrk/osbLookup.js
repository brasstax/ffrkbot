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
      name: 'osb',
      group: 'ffrk',
      memberName: 'osb',
      description: 'Looks up overstrike soulbreaks for a given character.',
      examples: ['osb Squall', 'osb Zell 1', 'osb \'onion knight\' 2'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'osbNumber',
          prompt: 'Enter the osb number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
      aliases: ['overstrike'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, osbNumber} = args;
    return botUtils.soulbreak(msg, characterName, 'osb', osbNumber)
      .catch( (err) => {
        console.log(`Error calling osbLookup: ${err}`);
      });
  };
};
