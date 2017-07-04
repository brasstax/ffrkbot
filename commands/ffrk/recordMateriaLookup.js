const {Command} = require('discord.js-commando');
const botUtils = require('../../utilities/record-materia-bot-utils.js');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'record-materia',
      group: 'ffrk',
      memberName: 'record-materia',
      description: 'Looks up a record materia by name.',
      examples: ['rm Attunement I', 'record-materia Truthseeker',
        'record Bolt from Above'],
      args: [
        {
          key: 'record_materia',
          prompt: 'Enter the name of the record materia you want to look up.',
          type: 'string',
        },
      ],
      aliases: ['record', 'rm'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {record_materia} = args;
    return botUtils.recordMateria(msg, record_materia);
  };
};
