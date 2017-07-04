const {Command} = require('discord.js-commando');
const botUtils = require('../../utilities/legend-materia-bot-utils.js');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'legend-materia',
      group: 'ffrk',
      memberName: 'legend-materia',
      description: 'Looks up a record materia by name.',
      examples: ['lm Lone Wolf', 'legend-materia Caretaker of the Planet',
        'legend Shining Soul'],
      args: [
        {
          key: 'legend_materia',
          prompt: 'Enter the name of the legend materia you want to look up.',
          type: 'string',
        },
      ],
      aliases: ['legend', 'lm'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {legend_materia} = args;
    return botUtils.legendMateria(msg, legend_materia);
  };
};
