const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic reply command.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'shrug',
      group: 'misc',
      memberName: 'shrug',
      description: '¯\\\_(ツ)\_\/\¯',
      examples: ['shrug'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @return {Method} msg.say: string
   **/
  run(msg) {
    return msg.channel.send('¯\\\_(ツ)\_\/¯');
  };
};
