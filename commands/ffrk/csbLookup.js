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
      name: 'csb',
      group: 'ffrk',
      memberName: 'csb',
      description: 'Looks up chain soulbreaks for a given character.',
      examples: ['csb Squall', 'csb Zell 1', 'csb \'onion knight\' 2'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'csbNumber',
          prompt: 'Enter the csb number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
      aliases: ['chain'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, csbNumber} = args;
    return botUtils.soulbreak(msg, characterName, 'csb', csbNumber)
      .catch( (err) => {
        console.log(`Error calling csbLookup: ${err}`);
      });
  };
};
