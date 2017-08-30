const {Command} = require('discord.js-commando');
const Superagent = require('superagent');

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'catfacts',
      group: 'misc',
      memberName: 'catfacts',
      description: 'Gets a cat fact.',
      examples: ['catfacts'],
      aliases: ['cat', 'catfact'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   **/
  run(msg) {
    let url = 'http://www.pycatfacts.com/catfacts.txt';
    Superagent.get(url)
      .then((response) => {
        msg.channel.send(response.text)
          .catch((error) => {
            console.log(`Catfacts error on msg.send: ${error}`);
          });
      }).catch((error) => {
        console.log(`Catfacts error in superagent: ${error}`);
      });
  };
};
