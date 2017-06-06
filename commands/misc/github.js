const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic reply command.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'github',
      group: 'misc',
      memberName: 'github',
      description: 'Gives the github link to the project.',
      examples: ['github'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @return {Method} msg.say: string
   **/
  run(msg) {
    return msg.channel.send('https://github.com/brasstax/ffrkbot/');
  };
};
