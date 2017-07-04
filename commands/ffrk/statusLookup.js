const {Command} = require('discord.js-commando');
const botUtils = require('../../utilities/status-bot-utils.js');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'status',
      group: 'ffrk',
      memberName: 'status',
      description: 'Looks up a status by name.',
      examples: ['status Poison', 'stat EX: Timeless'],
      args: [
        {
          key: 'status_effect',
          prompt: 'Enter the name of the status effect you want to look up.',
          type: 'string',
        },
      ],
      aliases: ['stat'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {status_effect} = args;
    return botUtils.status(msg, status_effect);
  };
};
