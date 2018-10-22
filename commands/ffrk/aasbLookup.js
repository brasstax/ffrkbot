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
      name: 'aasb',
      group: 'ffrk',
      memberName: 'aasb',
      description: 'Looks up alcoholic anonymous ' +
        'overstrikes for a given character.',
      examples: ['aasb Kain'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'aasbNumber',
          prompt: 'Enter the aasb number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
      aliases: [],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, aasbNumber} = args;
    return botUtils.soulbreak(msg, characterName, 'aasb', aasbNumber)
      .catch( (err) => {
        console.log(`Error calling asbLookup: ${err}`);
      });
  };
};
