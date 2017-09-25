const {Command} = require('discord.js-commando');
const botUtils = require('../../utilities/other-spreadsheet-bot-utils.js');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'other',
      group: 'ffrk',
      memberName: 'other',
      description: 'Looks up misc stuff in the Other spreadsheet.',
      examples: ['other Tsui', 'other Fiery Lightning'],
      args: [
        {
          key: 'other_effect',
          prompt: 'Enter the name of the Other entry you want to look up.',
          type: 'string',
        },
      ],
      aliases: ['o'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {other_effect} = args;
    return botUtils.other(msg, other_effect);
  };
};
