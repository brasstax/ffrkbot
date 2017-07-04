const util = require('util');
const {RichEmbed} = require('discord.js');
const jsonQuery = require('json-query');
const escapeStringRegexp = require('escape-string-regexp');
const titlecase = require('titlecase');

const fs = require('fs');
const path = require('path');

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirRecordMateriaPath = path.join(enlirJsonPath, 'recordMateria.json');
const enlirRecordMateriaFile = fs.readFileSync(enlirRecordMateriaPath);
const enlirRecordMateria = JSON.parse(enlirRecordMateriaFile);

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
  let query;
  query = titlecase.toLaxTitleCase(args);
  query = escapeStringRegexp(query);
  console.log(`RecordMateria to look up: ${query}`);
  console.log(`,status caller:` +
      ` ${msg.author.username}#${msg.author.discriminator}`);
  let queryString = util.format('[*name~/%s/i]', query);
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: enlirRecordMateria,
    allowRegexp: true,
  });
  if (result.value.length === 0) {
    queryString = util.format('[*character~/%s$/i]', query);
    console.log(`queryString: ${queryString}`);
    result = jsonQuery(queryString, {
      data: enlirRecordMateria,
      allowRegexp: true,
    });
  };
  console.log(result);
  if (result.value.length === 0) {
    msg.channel.send(`Search for ${query} not found.`);
  } else {
    result.value.forEach( (value) => {
      let rm = {Object};
      rm.value = value;
      sendRichEmbedRecordMateria(rm, msg)
        .catch( (err) => {
          console.log(`Error with sendRichEmbedRecordMateria: ${err}`);
      });
    });
  };
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
