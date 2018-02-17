const {Command} = require('discord.js-commando');
const botUtils = require('../../utilities/ability-bot-utils.js');

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
      examples: ['ability Firaja', 'ability gaia\'s cross'],
      args: [
        {
          key: 'abilityName',
          prompt: 'Enter the name of the ability you wish to look up.',
          type: 'string',
        },
      ],
      aliases: ['abil'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {object} Promise
   **/
  run(msg, args) {
    const {abilityName} = args;
    return botUtils.ability(msg, abilityName)
      .catch( (err) => {
        console.log(`Error in running ability command: ${err}`);
      });
  };
};
