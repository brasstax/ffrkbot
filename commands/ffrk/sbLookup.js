const {Command} = require('discord.js-commando');
const path = require('path');
botPath = path.join(__dirname, '..', '..', 'utilities', 'botUtilities.js');
const botUtils = require(botPath);

module.exports = class ReplyCommand extends Command {
  /** constructor for looking up soulbreaks.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'sb',
      group: 'ffrk',
      memberName: 'sb',
      description: 'Looks up the soulbreaks for a given character.' +
        ' Can filter out by soul break types (defaults to all soul breaks.)',
      examples: ['sb Squall', 'sb Cloud usb', 'sb "Cid Raines" bsb'],
      args: [
        {
          key: 'character_name',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'sb_type',
          prompt: '(Optional) Enter the type of soul break you want to see' +
            '(all, SB, SSB, BSB, USB, OSB, or CSB. Defaults to "all".)',
          type: 'string',
          default: 'all',
        },
      ],
      aliases: ['soulbreak'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    const {character_name, sb_type} = args;
    return botUtils.soulbreak(msg, character_name, sb_type);
  };
};
