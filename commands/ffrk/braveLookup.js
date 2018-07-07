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
      name: 'brave',
      group: 'ffrk',
      memberName: 'brave',
      description: 'Looks up brave commands by character and brave level.',
      examples: ['brave Firion',
        'brave Exdeath 0', 'csb \'Cecil (Paladin)\' 2'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'braveLevel',
          prompt: 'Enter the brave level of the character' +
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
    const {characterName, braveLevel} = args;
    return botUtils.braveLookup(msg, characterName, braveLevel)
      .catch( (err) => {
        console.log(`Error calling braveLookup: ${err}`);
      });
  };
};
