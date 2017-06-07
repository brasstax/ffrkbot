const {Command} = require('discord.js-commando');
const path = require('path');
botPath = path.join(__dirname, '..', '..', 'utilities', 'botUtilities.js');
const botUtils = require(botPath);

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'bsb',
      group: 'ffrk',
      memberName: 'bsb',
      description: 'Looks up a burst soulbreak for a given character.',
      examples: ['bsb Squall', 'bsb Zell 1'],
      args: [
        {
          key: 'character_name',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'bsb_number',
          prompt: 'Enter the BSB number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, bsbNumber} = args;
    return botUtils.bsb(msg, characterName, bsbNumber);
  };
};
