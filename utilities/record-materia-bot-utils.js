const util = require('util');
const {RichEmbed} = require('discord.js');
const jsonQuery = require('json-query');
const escapeStringRegexp = require('escape-string-regexp');

const fs = require('fs');
const path = require('path');

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirRecordMateriaPath = path.join(enlirJsonPath, 'recordMateria.json');
const enlirRecordMateriaFile = fs.readFileSync(enlirRecordMateriaPath);
const enlirRecordMateria = JSON.parse(enlirRecordMateriaFile);
const botPath = path.join(__dirname, 'common-bot-utils');
const botUtils = require(botPath);

/** exports.recordMateria
 * Retrieves information about a record materia.
 * @param {object} msg: A message object from the discord.js bot.
 * @param {string} args: the status to look up.
 **/
exports.recordMateria = function lookupRecordMateria(msg, args) {
  if (args.length < 3) {
    msg.reply('Search query must be at least three characters.');
    return;
  };
  let query = args;
  query = escapeStringRegexp(query);
  console.log(`RecordMateria to look up: ${query}`);
  console.log(`,status caller:` +
      ` ${msg.author.username}#${msg.author.discriminator}`);
  let queryString;
  if (botUtils.checkAlias(query) !== null) {
    query = botUtils.checkAlias(query);
    query = escapeStringRegexp(query);
  };
  queryString = util.format('[*character~/%s$/i]', query);
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: enlirRecordMateria,
    allowRegexp: true,
  });
  if (result.value.length === 0) {
    queryString = util.format('[*name~/%s/i]', query);
    console.log(`queryString: ${queryString}`);
    result = jsonQuery(queryString, {
      data: enlirRecordMateria,
      allowRegexp: true,
    });
  };
  if (result.value.length === 0) {
    msg.channel.send(`Search for ${query} not found.`);
  } else if (result.value.length === 1) {
    result.value.forEach( (value) => {
      // sendRichEmbedRecordMateria expects a single result with a .value
      // property so we create a new Object and set its .value to each result's
      // .value
      let rm = {
        value,
      };
      sendRichEmbedRecordMateria(rm, msg)
        .catch( (err) => {
          console.log(`Error with sendRichEmbedRecordMateria: ${err}`);
      });
    });
  } else if (result.value.length > 20) {
    msg.channel.send(`Over 20 results returned for the search term '${query}'.
       Please narrow your search.`);
  } else {
    let embed = exports.createRecordMateriaSummary(result);
    msg.channel.send({embed})
    .catch( (err) => {
      console.log(`error sending createRecordMateriaSummary embed: ${err}`);
    });
  };
};

/** createRecordMateriaSummary:
 *  creates a summary of a character's record materia.
 *  @param {Object} results: the results of a record materia's search
 *  @return {Object} embed: a discord.js-commando embed object to send
**/
exports.createRecordMateriaSummary =
function createRecordMateriaSummary(results) {
  let embed = new RichEmbed()
    .setTitle('Record Materia Search Results')
    .setDescription('Search by record materia name for more details')
    .setColor('#bfdaff');
  results.value.forEach( (result) => {
    let recordMateria = result;
    let character = recordMateria.character;
    let name = recordMateria.name;
    let unlock = recordMateria.unlockCriteria;
    let description = (recordMateria.effect !== undefined) ?
      (recordMateria.effect) : ('N/A');
    let nameField = util.format('%s: %s {Unlock: %s}', character, name, unlock);
    embed.addField(nameField, description);
  });
  return embed;
};
/** sendRichEmbedRecordMateria:
 * Processes and outputs information about a status effect in
 * RichEmbed format.
 * @param {object} result: the result from lookupRecordMateria.
 * @param {object} msg: discord.js message object.
 * @return {object} Promise
 **/
function sendRichEmbedRecordMateria(result, msg) {
  return new Promise( (fulfill, reject) => {
    recordMateria = result.value;
    let description = (recordMateria.effect !== undefined) ?
      (recordMateria.effect) : ('N/A');
    let name = recordMateria.name;
    let character = recordMateria.character;
    let unlock = recordMateria.unlockCriteria;
    let realm = recordMateria.realm;
    let embed = new RichEmbed()
      .setTitle(name)
      .setDescription(description)
      .setColor('#bfdaff')
      .addField('Realm', realm, true)
      .addField('Character', character, true)
      .addField('Unlock Criteria', unlock);
    msg.channel.send({embed})
      .then( (resolve) => {
        fulfill(resolve);
      }).catch( (error) => {
        console.log(`Error in sendRichEmbedRecordMateria: ${error}`);
        reject(error);
      });
  });
};
