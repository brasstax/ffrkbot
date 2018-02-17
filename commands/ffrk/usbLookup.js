const {Command} = require('discord.js-commando');
const path = require('path');
botPath = path.join(
  __dirname, '..', '..', 'utilities', 'soulbreak-bot-utils.js');
const botUtils = require(botPath);

module.exports = class ReplyCommand extends Command {
  /** constructors a basic ability lookup.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'usb',
      group: 'ffrk',
      memberName: 'usb',
      description: 'Looks up ultra soulbreaks for a given character.',
      examples: ['usb Squall', 'usb Zell 1', 'usb \'onion knight\' 2'],
      args: [
        {
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'usbNumber',
          prompt: 'Enter the usb number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
        },
      ],
      aliases: ['ultra'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {characterName, usbNumber} = args;
    return botUtils.soulbreak(msg, characterName, 'usb', usbNumber)
      .catch( (err) => {
        console.log(`Error calling usbLookup: ${err}`);
      });
  };
};
