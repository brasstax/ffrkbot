const { google } = require('googleapis');
const util = require('util');
const fs = require('fs');
const OAuth2Client = google.auth.OAuth2;
fs.readFileAsync = util.promisify(fs.readFile);
const titlecase = require('titlecase');
const escapeStringRegexp = require('escape-string-regexp');
const pad = require('pad');

// const path = require('path');
// speedrankPath = path.join(__dirname, 'speed-general-utils.js');
//    '..', '..', 'utilities', 'speedrank-utils.js');
const speedrankUtils = require('./speed-general-utils.js');

const SPREADSHEET_ID = '11gTjAkpm4D3uoxnYCN7ZfbiVnKyi7tmm9Vp9HvTkGpw';
const TOKEN_PATH = 'secrets/credentials.json';
const SECRETS_PATH = 'secrets/client_secret.json';

/** authorize():
 * Authorizes Google credentials.
 * @return {google.auth.OAuth2} oAuth2Client
 **/
async function authorize() {
  let secrets;
  let token;
  try {
    secrets = await fs.readFileAsync(SECRETS_PATH);
    token = await fs.readFileAsync(TOKEN_PATH);
    const credentials = JSON.parse(secrets);
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new OAuth2Client(
      client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    console.log('Unable to open SECRETS_PATH or TOKEN_PATH', err);
  }
}

exports.speedrank = function lookupSpeedrank(
  msg, player, category, secondaryCategory) {
  console.log(util.format('.top caller: %s#%s for top %s %s (%s)',
    msg.author.username, msg.author.discriminator,
    player, category, secondaryCategory));
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({ version: 'v4' });
    authorize()
      .then((oAuth2Client) => {
        category = escapeStringRegexp(category);
        secondaryCategory = escapeStringRegexp(secondaryCategory);
        category = category.toLowerCase();
        const categorySheet = getSheet(category, secondaryCategory);
        player = escapeStringRegexp(player);

        const request = {
          spreadsheetId: SPREADSHEET_ID,
          range: categorySheet,
          auth: oAuth2Client,
        };
        sheets.spreadsheets.values.get(request, (err, { data }) => {
          if (err) {
            if (err.code === 400) {
              console.log(err.code);
              msg.channel.send(`Invalid speedrun category "${category}".`)
                .then((res) => {
                  resolve(res);
                  return;
                });
            } else {
              console.log(err);
              msg.channel.send(
                'The bot user has not set up valid Google API credentials yet.')
                .then((res) => {
                  resolve(res);
                  return;
                });
            }
          } else {
            // CategoryNames (headers) are fixed for the rank request
            let categoryNames = ['Boss', 'Rank', 'Time'];

            //Fight names are always in Row 2
            const fightRow = data.values[2];

            let fightNames = [];
            for (let i = 1; i < fightRow.length; i++) {
              if (speedrankUtils.checkCell(fightRow[i] === '')) {
                continue;
              }
              else {
                fightNames.push(fightRow[i]);
              }
            }

            let contestants = [];
            let padLength = 0;
            let playerActualName = player;

            // Now that we know the fights, let's search each fight column for the player in question
            for (let catName of fightNames) {
              let categoryRange = speedrankUtils.find(catName, data.values);

              //TODO: Get max rows of table
              for (let i = 0; i < 500; i++) {
                // categoryRange.row + 2 will give us the starting row of
                // contestants.
                let row = categoryRange.row + 2 + i;
                //console.log("row = " + row);
                // Stop processing if we've hit the end of the list.
                if (data.values[row] === undefined) {
                  break;
                }
                let contestant = [];
                // entryStartPos gives us the starting cell
                // with the contestant name.
                const entryStartPos = categoryRange.columnNum - 1;
                let cell = speedrankUtils.checkCell(data.values[row][entryStartPos]);
                if (catName.length > padLength) {
                  padLength = catName.length + 1;
                  console.log(padLength);
                }
                if (cell.toLowerCase() === player.toLowerCase()) {

                  //Grab the spreadsheet formatted version of the player's name
                  playerActualName = cell;

                  //Grab the name of the boss the player has an entry for
                  contestant.push(catName);

                  // Grab the actual rank of this row
                  contestant.push(speedrankUtils.checkCell(data.values[row][0]));

                  // The Overall category and Torment sheets places avg time in the third column. Others have them in the second
                  if (catName === "Overall" || categorySheet === 'Torment') {
                    contestant.push(speedrankUtils.checkCell(data.values[row][entryStartPos + 2]));
                  }
                  else {
                    contestant.push(speedrankUtils.checkCell(data.values[row][entryStartPos + 1]));
                  }

                  contestants.push(contestant);
                  break;
                }
              }
            }
            const rankTable =
              outputRankTable(categorySheet, playerActualName,
                categoryNames, contestants, padLength);
            msg.channel.send(rankTable)
              .then((res) => {
                resolve(res);
              });
          }
        });
      });
  });
};

/** getSheet():
 *  returns a sheet based on the shorthand input the user provides.
 * @param {String} category: the category the user inputs.
 * @param {String} secondaryCategory: the secondaryCategory the user inputs.
 * @return {String} sheet
 **/
function getSheet(category, secondaryCategory) {
  let version = "Overall";

  // check for various permutations of "No CSB"
  if (['no-csb', 'nocsb', 'no', 'no csb'].includes(secondaryCategory.toLowerCase())) {
    version = 'No CSB';
  }

  // check for various permutations of fight, e.g. "4 star", "Torment" and convert to sheet name
  if (['3', '3star', '3-star', '3 star'].includes(category.toLowerCase())) {
    category = `GL 3* ${version} rankings`;
  }
  else if (['4', '4star', '4-star', '4 star'].includes(category.toLowerCase())) {
    category = `GL 4* ${version} rankings`;
  }
  else if (['5', '5star', '5-star', '5 star'].includes(category.toLowerCase())) {
    category = `GL 5* ${version} rankings`;
  }
  else if (['torment', 'tor', 'neotorment', 'neo'].includes(category.toLowerCase())) {
    category = 'Torment';
  }
  else {
    category = 'Error';
  }

  return category;
}

/**
  * Formats a ranking table for output.
  * @param {String} category
  * @param {String} player
  * @param {Array} categoryNames
  * @param {Array} contestants
  * @param {Integer} namePadLength
  * @return {String} table
  */
function outputRankTable(category, player,
  categoryNames, contestants, namePadLength) {
  let table = '';
  table += outputTitle(category, player);
  table += outputCategoryHeader(categoryNames, namePadLength);
  table += outputContestants(contestants, namePadLength);
  table = util.format('```%s```', table);
  return table;
}
/**
  * Outputs the title of the table.
  * @param {String} category
  * @param {String} player
  * @return {String} title
  */
function outputTitle(category, player) {
  let title = '';
  title = `${player} - ${category}\n`;
  return title;
}
/**
  * Outputs category headers for table.
  * @param {Array} categoryNames
  * @param {Integer} namePadLength
  * @return {String} categoryHeader
  */
function outputCategoryHeader(categoryNames, namePadLength) {
  let categoryHeader = '';
  categoryHeader += pad(categoryNames[0], namePadLength);
  categoryHeader += ' | ';
  categoryHeader += pad(categoryNames[1], 4);
  categoryHeader += ' | ';
  categoryHeader += pad(categoryNames[2], 5);
  categoryHeader += ' | ';

  const repeatLength = categoryHeader.length - 1;
  categoryHeader += '\n';
  // create a series of dashes to indicate header
  categoryHeader += '-'.repeat(repeatLength);
  categoryHeader += '\n';
  return categoryHeader;
}
/**
  * Outputs contestants.
  * @param {Array} contestants
  * @param {Integer} namePadLength
  * @return {String} formattedContestants
  */
function outputContestants(contestants, namePadLength) {
  let formattedContestants = '';
  for (let i = 0; i < contestants.length; i++) {

    //boss output
    formattedContestants += pad(contestants[i][0], namePadLength);
    formattedContestants += ' | ';
    //rank output
    formattedContestants += pad(contestants[i][1], 4);
    formattedContestants += ' | ';
    //time output
    formattedContestants += pad(contestants[i][2], 5);
    formattedContestants += ' | ';

    formattedContestants += '\n';
  }
  return formattedContestants;
}
