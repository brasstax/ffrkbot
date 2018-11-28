const {Command} = require('discord.js-commando');
const path = require('path');
speedrankPath = path.join(__dirname,
  '..', '..', 'utilities', 'speedrank-utils.js');
const speedrankUtils = require('../../utilities/speedrank-utils.js');

module.exports = class ReplyCommand extends Command {
  /** constructor for looking up soulbreaks.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'rank',
      group: 'misc',
      memberName: 'speedrank',
      description: 'Looks up all the entries for a given speedrunner in a specified leaderboard' +
      ' from the FFRecordKeeper Discord Speedrun challenge leaderboard' +
      ' (https://docs.google.com/spreadsheets/d/11gTjAkpm4D3uoxnYCN7ZfbiVnKyi7tmm9Vp9HvTkGpw).',
      examples: ['rank EverythingIsGravy 5star', 'rank dragoonic 4star no-csb', 'rank littlefiredragon'],
      args: [
        {
          key: 'name',
          prompt: 'Enter the speedrunner you want to query.' +
          ' Make sure you use the name as it appears in the spreadsheet.',
          type: 'string',
          default: 'EverythingIsGravy',
        },
        {
          key: 'category',
          prompt: 'Enter the name of the category you want to look up.' +
          ' (Can be "5star", "4star", "3star", or "Torment" ' +
          ' on the chart. The default is "4star")',
          type: 'string',
          default: '4star',
        },
        {
          key: 'secondaryCategory',
          prompt: 'Specify if you want the overall or no-csb ranking' +
          ' no-csb does not apply to Torment' +
          ' (defaults to "overall".)',
          type: 'string',
          default: 'overall',
        },
      ],
      aliases: ['speedrank'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    console.log('Im in ur msg');
    const {name, category, secondaryCategory} = args;
    return speedrankUtils.speedrank(msg, name, category, secondaryCategory)
      .catch( (err) => {
        console.log('error in speedrank command:', err);
      });
  };
};
