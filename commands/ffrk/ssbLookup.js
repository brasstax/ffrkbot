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
      name: 'ssb',
      group: 'ffrk',
      memberName: 'ssb',
      description: 'Looks up super soulbreaks for a given character.',
      examples: ['ssb Squall', 'ssb Zell 1', 'ssb \'onion knight\' 2'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'ssbNumber',
          prompt: 'Enter the ssb number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
      aliases: ['super'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, ssbNumber} = args;
    return botUtils.soulbreak(msg, characterName, 'ssb', ssbNumber)
      .catch( (err) => {
        console.log(`Error calling ssbLookup: ${err}`);
      });
  };
};
