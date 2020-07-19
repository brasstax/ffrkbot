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
      name: 'sasb',
      group: 'ffrk',
      memberName: 'sasb',
      description: 'Looks up a Synchro Arcane SoulBreak ' +
        'for a given character.',
      examples: ['sasb Tifa'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'sasbNumber',
          prompt: 'Enter the sasb number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
      aliases: ['synchro','sync'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, sasbNumber} = args;
    return botUtils.soulbreak(msg, characterName, 'sasb', sasbNumber)
      .catch( (err) => {
        console.log(`Error calling sasbLookup: ${err}`);
      });
  };
};
