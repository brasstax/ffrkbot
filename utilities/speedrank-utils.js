const {google} = require('googleapis');
const util = require('util');
const fs = require('fs');
const OAuth2Client = google.auth.OAuth2;
fs.readFileAsync = util.promisify(fs.readFile);
const titlecase = require('titlecase');
const escapeStringRegexp = require('escape-string-regexp');
const pad = require('pad');

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
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new OAuth2Client(
      client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    console.log('Unable to open SECRETS_PATH or TOKEN_PATH', err);
  }
}

exports.speedrank = function lookupspeedrank(
  msg, player, category, secondaryCategory) {
  console.log(util.format('.top caller: %s#%s for top %s %s (%s)',
    msg.author.username, msg.author.discriminator,
    player, category, secondaryCategory));
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({version: 'v4'});
    authorize()
      .then((oAuth2Client) => {
        category = escapeStringRegexp(category);
        secondaryCategory = escapeStringRegexp(secondaryCategory);
        category = category.toLowerCase();
        const categorySheet = getSheet(category, secondaryCategory);
        player  = escapeStringRegexp(player);

        const request = {
          spreadsheetId: SPREADSHEET_ID,
          range: categorySheet,
          auth: oAuth2Client,
        };
        sheets.spreadsheets.values.get(request, (err, {data}) => {
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
            for(let i = 1; i < fightRow.length; i++) {
              if (fightRow[i] === undefined ||
                fightRow[i] === '' ||
                fightRow[i] === null) {
                continue;
              }
              else {
                fightNames.push(fightRow[i]);
              } 
            }


            let contestants = [];
            let padLength = 0;

            // Now that we know the fights, let's search each fight column for the player in question
           for (let catName of fightNames) {
              let categoryRange = find(catName, data.values);

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
                let cell = checkCell(data.values[row][entryStartPos]);
                if (catName.length > padLength) {
                  padLength = catName.length + 1;
                  console.log(padLength);
                }
                if (cell.toLowerCase() === player.toLowerCase()) {
                  contestant.push(catName);
                  // Grab the actual rank of this row
                  contestant.push(checkCell(data.values[row][0]));

                  // The Overall category and Torment sheets places avg time in the third column. Others have them in the second
                  if (catName === "Overall" || categorySheet === 'Torment'){
                    contestant.push(checkCell(data.values[row][entryStartPos+2]));
                  }
                  else {
                    contestant.push(checkCell(data.values[row][entryStartPos+1]));
                  }

                  contestants.push(contestant);
                  break;
                }
              }
            }
            const rankTable =
              outputRankTable(categorySheet, player,
                categoryNames, contestants, padLength);
            msg.channel.send(rankTable)
              .then( (res) => {
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
  if (secondaryCategory === 'no-csb'){
    version = 'No CSB';
  }
  switch (category) {
    case '3star':
      category = `GL 3* ${version} rankings`;
      break;
    case '4star':
      category = `GL 4* ${version} rankings`;
      break;
    case '5star':
      //category = 'GL 5* '+version+ ' rankings';
      category = `GL 5* ${version} rankings`;
      break;
    case 'torment':
      category = 'Torment';
      break;
    default:
      category = 'Error';
    }
  return category;
}
 /**
 * Finds a value within a given range.
 * @see https://stackoverflow.com/questions/10807936/how-do-i-search-google-spreadsheets/10823543#10823543
 * @param {String} value The value to find.
 * @param {String} data The range to search in using Google's A1 format.
 * @return {Object} A range pointing to the first cell containing the value,
 *     or null if not found.
 */
function find(value, data) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      //console.log('Searching:'+data[i][j]);
      if (data[i][j] == value) {
        const columnName = columnToName(j + 1);
        return {row: i + 1, column: columnName, columnNum: j + 1};
      }
    }
  }
  return null;
}
/**
 * Returns the Google Spreadsheet column name equivalent of a number.
 * @param {Integer} columnNumber The column number to look for
 * @return {String} columnName
 */
function columnToName(columnNumber) {
  let columnName = '';
  let modulo;
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  while (columnNumber > 0) {
    modulo = (columnNumber - 1) % 26;
    columnName = alpha.charAt(modulo) + columnName;
    columnNumber = Math.floor((columnNumber - modulo)/26);
  }
  return columnName;
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
/**
  * Ensures null cells don't mess with anything.
  * @param cell
  * @return {String} cell or ''
  */
function checkCell(cell) {
  if (cell === undefined || cell === '' || cell === null) {
    return '';
  }
  else{
    return cell;
  }
}
