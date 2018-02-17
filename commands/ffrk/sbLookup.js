const {Command} = require('discord.js-commando');
const path = require('path');
botPath = path.join(__dirname,
  '..', '..', 'utilities', 'soulbreak-bot-utils.js');
const botUtils = require('../../utilities/soulbreak-bot-utils.js');

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
          key: 'characterName',
          prompt: 'Enter the name of the character you wish to look up.',
          type: 'string',
        },
        {
          key: 'sbType',
          prompt: '(Optional) Enter the type of soul break you want to see' +
            '(all, SB, SSB, BSB, USB, OSB, or CSB. Defaults to "all".)',
          type: 'string',
          default: 'all',
        },
        {
          key: 'sbNumber',
          prompt: 'Enter the SB number of the character' +
            ' you wish to look up. (Optional.)',
          type: 'integer',
          default: '',
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
    const {characterName, sbType, sbNumber} = args;
    return botUtils.soulbreak(msg, characterName, sbType, sbNumber)
      .catch( (err) => {
        console.log(`Error calling botUtils.soulbreak: ${err}`);
      });
  };
};
