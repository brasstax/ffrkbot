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
      name: 'ability',
      group: 'ffrk',
      memberName: 'ability',
      description: 'Looks up an ability by name.',
      examples: ['ability Firaja'],
      args: [
        {
          key: 'ability_name',
          prompt: 'Name of the ability you wish to look up',
          type: 'string',
        },
      ],
    });
  }

  /** trigger to run open invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {ability_name} = args;
    return botUtils.ability(msg, ability_name);
  };
};
