const util = require('util');
const {RichEmbed} = require('discord.js');
const jsonQuery = require('json-query');
const escapeStringRegexp = require('escape-string-regexp');
const titlecase = require('titlecase');

const fs = require('fs');
const path = require('path');

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirLegendMateriaPath = path.join(enlirJsonPath, 'legendMateria.json');
const enlirLegendMateriaFile = fs.readFileSync(enlirLegendMateriaPath);
const enlirLegendMateria = JSON.parse(enlirLegendMateriaFile);
const botPath = path.join(__dirname, 'common-bot-utils');
const botUtils = require(botPath);

/** exports.legendMateria
 * Retrieves information about a legend materia.
 * @param {object} msg: A message object from the discord.js bot.
 * @param {string} args: the status to look up.
 **/
exports.legendMateria = function lookupLegendMateria(msg, args) {
  if (args.length < 3) {
    msg.reply('Search query must be at least three characters.');
    return;
  };
  let query;
  query = titlecase.toLaxTitleCase(args);
  query = escapeStringRegexp(query);
  let queryString;
  console.log(`LegendMateria to look up: ${query}`);
  console.log(`,status caller:` +
      ` ${msg.author.username}#${msg.author.discriminator}`);
  if (botUtils.checkAlias(query) !== null) {
    query = botUtils.checkAlias(query);
    query = escapeStringRegexp(query);
  };
  queryString = util.format('[*character~/%s$/i]', query);
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: enlirLegendMateria,
    allowRegexp: true,
  });
  if (result.value.length === 0) {
    queryString = util.format('[*name~/%s/i]', query);
    result = jsonQuery(queryString, {
      data: enlirLegendMateria,
      allowRegexp: true,
    });
  };
  if (result.value.length === 0) {
    msg.channel.send(`Query for ${query} not found.`);
  } else if (result.value.length === 1) {
    result.value.forEach( (value) => {
      let lm = {
        value,
      };
      sendRichEmbedLegendMateria(lm, msg)
        .catch( (err) => {
          console.log(`Error with sendRichEmbedLegendMateria: ${err}`);
      });
    });
  } else if (result.value.length > 20) {
    msg.channel.send(`Over 20 results found for the search term '${query}'.
       Please narrow your search.`);
  } else {
    let embed = exports.createLegendMateriaSummary(result);
    msg.channel.send({embed})
      .catch( (err) => {
        console.log(`Error with createLegendMateriaSummary embed: ${err}`);
    });
  };
};
/** createLegendMateriaSummary:
 *  creates a summary of a character's legend materia.
 *  @param {Object} results: the results of a legend materia's search
 *  @return {Object} embed: a discord.js-commando embed object to send
**/
exports.createLegendMateriaSummary =
function createLegendMateriaSummary(results) {
  let embed = new RichEmbed()
    .setTitle('Legend Materia Search Results')
    .setDescription('Search by legend materia name for more details')
    .setColor('#bfdaff');
  results.value.forEach( (result) => {
    let legendMateria = result;
    let character = legendMateria.character;
    let name = legendMateria.name;
    let relic = (legendMateria.relic !== '-') ?
      (legendMateria.relic) : ('N/A');
    let description = (legendMateria.effect !== undefined) ?
      (legendMateria.effect) : ('N/A');
    let nameField = util.format('%s: %s {Relic: %s}', character, name, relic);
    embed.addField(nameField, description);
  });
  return embed;
};
/** sendRichEmbedLegendMateria:
 * Processes and outputs information about a status effect in
 * RichEmbed format.
 * @param {object} result: the result from lookupLegendMateria.
 * @param {object} msg: discord.js message object.
 * @return {object} Promise
 **/
function sendRichEmbedLegendMateria(result, msg) {
  return new Promise( (fulfill, reject) => {
    legendMateria = result.value;
    let description = (legendMateria.effect !== undefined) ?
      (legendMateria.effect) : ('N/A');
    let name = legendMateria.name;
    let character = legendMateria.character;
    let master = (legendMateria.master !== undefined) ?
      (legendMateria.master) : 'N/A';
    let relic = legendMateria.relic;
    let realm = legendMateria.realm;
    let embed = new RichEmbed()
      .setTitle(name)
      .setDescription(description)
      .setColor('#f7e62c')
      .addField('Realm', realm, true)
      .addField('Character', character, true)
      .addField('Relic', relic, true)
      .addField('Mastery effect', master, true);
    msg.channel.send({embed})
      .then( (resolve) => {
        fulfill(resolve);
      }).catch( (error) => {
        console.log(`Error in sendRichEmbedLegendMateria: ${error}`);
        reject(error);
      });
  });
};
