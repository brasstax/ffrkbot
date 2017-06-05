const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
  /** constructor
   * Initializes the ReplyCommand class.
   * @param {Object} client: a discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'reply',
      group: 'ffrk',
      memberName: 'reply',
      description: 'Replies with a message.',
      examples: ['reply'],
    });
  };
  /** run
   * Runs the command upon triggering with !reply.
   * @param {Object} msg: a discord.js-commando message.
   * @return {Method}: the bot saying the message.
   **/
  run(msg) {
    return msg.say('Hello consumer, yes hello consumer!');
  };
};
