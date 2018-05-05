const {google} = require('googleapis');
const util = require('util');
const fs = require('fs');
const OAuth2Client = google.auth.OAuth2;
fs.readFileAsync = util.promisify(fs.readFile);
const titlecase = require('titlecase');
const escapeStringRegexp = require('escape-string-regexp');

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

exports.speedrun = function lookupSpeedrun(
  msg, rows, category, secondaryCategory) {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({version: 'v4'});
    authorize()
      .then((oAuth2Client) => {
        category = escapeStringRegexp(category);
        category = category.toLowerCase();
        const categorySheet = getSheet(category);
        secondaryCategory = titlecase.toLaxTitleCase(secondaryCategory);
        sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: categorySheet,
          auth: oAuth2Client,
        }, (err, {data}) => {
          if (err) {
            if (err.code === 400) {
              console.log(err.message);
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
            const range = find(secondaryCategory, data.values);
            console.log(range);
            msg.channel.send(category)
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
 * @return {String} sheet
 **/
function getSheet(category) {
  switch (category) {
    case 'overall':
      category = 'GL 4* Overall rankings';
      break;
    case 'no-csb':
      category = 'GL 4* No CSB rankings';
      break;
    case 'cod':
      category = 'GL CoD Speedrun rankings';
      break;
    case 'magicite':
      category = '4* Magicite';
      break;
    default:
      category = titlecase.toLaxTitleCase(category);
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
      if (data[i][j] == value) {
        const columnName = columnToName(j + 1);
        return {row: i + 1, column: columnName};
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
