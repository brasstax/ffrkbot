const {Command} = require('discord.js-commando');
const path = require('path');
speedrunPath = path.join(__dirname,
  '..', '..', 'utilities', 'speedrun-utils.js');
const speedrunUtils = require('../../utilities/speedrun-utils.js');

module.exports = class ReplyCommand extends Command {
  /** constructor for looking up soulbreaks.
   * @param {Object} client: discord.js-commando client.
   **/
  constructor(client) {
    super(client, {
      name: 'top',
      group: 'misc',
      memberName: 'speedrun',
      description: 'Looks up the top 10 speedruns for a given category' +
      ' from the FFRecordKeeper Discord Speedrun challenge leaderboard' +
      ' (https://docs.google.com/spreadsheets/d/11gTjAkpm4D3uoxnYCN7ZfbiVnKyi7tmm9Vp9HvTkGpw).' +
      ' (You can specify a number for X, or omit it for the entire chart' +
      ' of a given category.)',
      examples: ['top 10', 'top 10 no-csb', 'top 5 cod', 'top 3 Maliris'],
      args: [
        {
          key: 'rows',
          prompt: 'Enter the amount of entries you want to return.' +
          ' The default is 5, and the maximum is 50.',
          type: 'integer',
          default: 5,
        },
        {
          key: 'category',
          prompt: 'Enter the name of the category you want to look up.' +
          ' (Can be "overall", "no-csb", "cod", or the name of a boss ' +
          ' on the chart. The default is "overall")',
          type: 'string',
          default: 'overall',
        },
        {
          key: 'secondaryCategory',
          prompt: 'For any other sheet that is not the GL 4* overall rankings' +
          ' or the GL 4* No CSB rankings, you can specify either "overall" or' +
          ' "no-csb" to get either the overall records or records for no-csb.' +
          ' (defaults to "overall".)',
          type: 'string',
          default: 'overall',
        },
      ],
      aliases: ['speed', 'speedrun', 'winner', 'winrar'],
    });
  }

  /** trigger to run upon invocation.
   * @param {Object} msg: discord.js-commando message.
   * @param {Array} args: args from the user input.
   * @return {Method} msg.say: string
   **/
  run(msg, args) {
    console.log('Im in ur msg');
    const {rows, category, secondaryCategory} = args;
    return speedrunUtils.speedrun(msg, rows, category, secondaryCategory)
      .catch( (err) => {
        console.log('error in speedrun command:', err);
      });
  };
};
