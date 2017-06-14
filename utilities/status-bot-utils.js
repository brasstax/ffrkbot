const util = require('util');
const {RichEmbed} = require('discord.js');
const jsonQuery = require('json-query');
const escapeStringRegexp = require('escape-string-regexp');
const titlecase = require('titlecase');

const fs = require('fs');
const path = require('path');
const botUtils = require(path.join(__dirname, 'common-bot-utils.js'));

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirStatusPath = path.join(enlirJsonPath, 'status.json');
const enlirStatusFile = fs.readFileSync(enlirStatusPath);
const enlirStatus = JSON.parse(enlirStatusFile);

/** exports.status
 * Retrieves information about a status condition.
 * @param {object} msg: A message object from the discord.js bot.
 * @param {string} args: the status to look up.
 **/
exports.status = function lookupStatus(msg, args) {
  if (args.length < 3) {
    msg.reply('Search query must be at least three characters.');
    return;
  };
  let query;
  query = titlecase.toLaxTitleCase(args);
  query = escapeStringRegexp(query);
  console.log(`Status to look up: ${query}`);
  console.log(`,status caller:` +
      ` ${msg.author.username}#${$msg.author.discriminator}`);
  let queryString = util.format('[commonName~/%s/i]', query);
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: enlirStatus,
    allowRegexp: true,
  });
  if (result.value === null) {
    msg.channel.send(`Status ${query} not found.`);
  } else {
    sendRichEmbedStatus(result, msg)
      .catch( (err) => {
        console.log(`Error with sendRichEmbedStatus: ${err}`);
      });
  };
};

/** sendRichEmbedStatus:
 * Processes and outputs information about a status effect in
 * RichEmbed format.
 * @param {object} result: the result from lookupStatus.
 * @param {object} msg: discord.js message object.
 * @return {object} Promise
 **/
function sendRichEmbedStatus(result, msg) {
  statusEffect = result.value;
  let description;
  let defaultDuration;
  let mndModifier;
  let exclusiveStatus;
  try {
    description = botUtils.returnDescription(statusEffect);
    defaultDuration = returnDefaultDuration(statusEffect);
    if (defaultDuration === 0) {
      defaultDuration = 'Until removed';
    };
    mndModifier = returnMndModifier(statusEffect);
    exclusiveStatus = returnExclusiveStatus(statusEffect);
  } catch (e) {
    console.log(`Error assigning sendRichEmbedStatus initial variables: ${e}`);
    console.log(`Setting values to 'N/A'.`);
    description = 'N/A';
    defaultDuration = 'N/A';
    mndModifier = 'N/A';
    exclusiveStatus = 'N/A';
  };
  let name = statusEffect.commonName;
  let notes = botUtils.returnNotes(statusEffect);
  let embed = new RichEmbed()
    .setTitle(name)
    .setDescription(description)
    .setColor('#8c42f4')
    .addField('Default duration', defaultDuration, true)
    .addField('MND modifier', mndModifier, true)
    .addField('Mutually exclusive status effects', exclusiveStatus)
    .addfield('Additional notes', notes);
  return new Promise( (fulfill, reject) => {
    msg.channel.send({embed})
      .then( (resolve) => {
        fulfill(resolve);
      }).catch( (error) => {
        console.log(`Error in sendRichEmbedStatus: ${error}`);
        reject(error);
      });
  });
};

/** returnExclusiveStatus:
 * Checks for a status effect's mutually-exlusive statuses. If it's a '-',
 * return "None". Otherwise, return the status effect's mutually-exclusive
 * statuses.
 * @param {object} statusEffects: the status effect JSON.
 * @return {string} any mutually-exclusive status effects.
 **/
function returnExclusiveStatus(statusEffects) {
  let effects = (statusEffects.exclusiveStatus !== '-') ?
    (statusEffects.exclusiveStatus) : ('None');
  return effects;
};

/** returnMndModifier:
 * Checks for a status effect's MND modifier. If it's a '-',
 * return 'None'. Otherwise, return the MND modifier.
 * @param {object} statusEffects: the status effect JSON.
 * @return {string} MND modifier.
 **/
function returnMndModifier(statusEffects) {
  let modifier = (statusEffects.mndModifier !== '-') ?
    (statusEffects.mndModifier) : ('None');
  return modifier;
};
