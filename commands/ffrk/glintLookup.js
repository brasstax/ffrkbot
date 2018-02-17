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
      name: 'glint',
      group: 'ffrk',
      memberName: 'glint',
      description: 'Looks up glint soulbreaks for a given character.',
      examples: ['glint Squall', 'glint Zell 1', 'glint \'onion knight\' 2'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'glintNumber',
          prompt: 'Enter the glint number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
      aliases: ['fsb', 'flash'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, glintNumber} = args;
    return botUtils.soulbreak(msg, characterName, 'glint', glintNumber)
      .catch( (err) => {
        console.log(`Error calling glintLookup: ${err}`);
      });
  };
};
