const util = require('util');
const {RichEmbed} = require('discord.js');
const jsonQuery = require('json-query');
const escapeStringRegexp = require('escape-string-regexp');
const titleCase = require('titlecase');

const fs = require('fs');
const path = require('path');

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirOtherPath = path.join(enlirJsonPath, 'other.json');
const enlirOtherFile = fs.readFileSync(enlirOtherPath);
const enlirOther = JSON.parse(enlirOtherFile);
const botPath = path.join(__dirname, 'common-bot-utils');
const botUtils = require(botPath);

/** exports.other
 * Retrieves information about an entry in the Other spreadsheet.
 * @param {object} msg: A message object from the discord.js bot.
 * @param {string} args: the status to look up.
 **/
exports.other = function lookupOtherSpreadsheet(msg, args) {
  if (args.length < 3) {
    msg.reply('Search query must be at least three characters.');
    return;
  };
  let query = args;
  query = escapeStringRegexp(query);
  console.log(`Other entry to look up: ${query}`);
  console.log(`,status caller:` +
      ` ${msg.author.username}#${msg.author.discriminator}`);
  let queryString;
  if (botUtils.checkAlias(query) !== null) {
    query = botUtils.checkAlias(query);
    query = escapeStringRegexp(query);
  };
  // bypasses issues with ampersands in queries (seriously)
  if (query.includes('&')) {
    query = titleCase.toLaxTitleCase(query);
    console.log(query);
    queryString = ['[name~?]', query];
  } else {
    queryString = util.format('[name~/%s/i]', query);
  }
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: enlirOther,
    allowRegexp: true,
  });
  if (result.value === null) {
    msg.channel.send(`Search for ${query} not found.`);
  } else {
    sendRichEmbedOther(result, msg)
      .catch( (err) => {
        console.log(`Error with sendRichEmbedOther: ${err}`);
    });
  };
};
/** sendRichEmbedOther:
 * Processes and outputs information about a status effect in
 * RichEmbed format.
 * @param {object} result: the result from lookupentry.
 * @param {object} msg: discord.js message object.
 * @return {object} Promise
 **/
function sendRichEmbedOther(result, msg) {
  return new Promise( (fulfill, reject) => {
    entry = result.value;
    let description = (entry.effects !== undefined) ?
      (entry.effects) : (botUtils.returnDefaultDuration(entry));
    let name = entry.name;
    let sb = (entry.sb !== undefined) ?
      (entry.sb) : (0);
    let time = (entry.time !== undefined) ?
      (entry.time) : ('N/A');
    let multiplier = (entry.multiplier !== undefined) ?
      (botUtils.returnMultiplier(entry)) : ('N/A');
    let source = entry.source;
    let target = entry.target;
    let embed = new RichEmbed()
      .setTitle(name)
      .setDescription(description)
      .setColor('#bfdaff')
      .addField('Source', source, true)
      .addField('Target', target, true)
      .addField('Cast time', time)
      .addField('Soul Break charge', sb, true)
      .addField('Multiplier', multiplier, true);
    msg.channel.send({embed})
      .then( (resolve) => {
        fulfill(resolve);
      }).catch( (error) => {
        console.log(`Error in sendRichEmbedentry: ${error}`);
        reject(error);
      });
  });
};
