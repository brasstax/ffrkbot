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
const enlirOtherPath = path.join(enlirJsonPath, 'other.json');
const enlirOtherFile = fs.readFileSync(enlirOtherPath);
const enlirStatus = JSON.parse(enlirStatusFile);
const enlirOther = JSON.parse(enlirOtherFile);

const enlirModifiedStatus =
  addOtherStatusToEnlirStatus(enlirStatus, enlirOther);

/** exports.status
 * Retrieves information about a status condition.
 * @param {object} msg: A message object from the discord.js bot.
 * @param {string} args: the status to look up.
 * @param {object} data: The enlirStatus dataset we want to use. We will
 * eventually pass in a modified enlirStatus that includes status from the Other
 * dataset.
 **/
exports.status = function lookupStatus(msg, args, data=enlirModifiedStatus) {
  if (args.length < 3) {
    msg.reply('Search query must be at least three characters.');
    return;
  };
  let query;
  query = titlecase.toLaxTitleCase(args);
  query = escapeStringRegexp(query);
  console.log(`Status to look up: ${query}`);
  console.log(`,status caller:` +
      ` ${msg.author.username}#${msg.author.discriminator}`);
  let queryString = util.format('[commonName~/%s/i]', query);
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: data,
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

/** addOtherStatusToEnlirStatus:
 *  Processes Enlir's Other spreadsheet for Status effects and puts them into
 *  the main status sheet. Enlir has some statuses in a worksheet known as Other
 *  most likely because they do not count as actual status effects in-game
 *  (No MND modifier, no duration, etc.) We want to combine these into the main
 *  status effect dataset for easier searching.
 *  @param {object} enlirStatus: the first set of Enlir's statuses in JSON.
 *  @param {object} enlirOther: the second set of Enlir's statuses in the Other
 *  sheet.
 *  @return {object} enlirCombinedStatus: enlirStatus combined with the status-
 *  effect entries from enlirOther.
 **/
 function addOtherStatusToEnlirStatus(enlirStatus, enlirOther) {
   enlirOther.forEach((entry) => {
     if (entry.character === 'Status') {
       enlirStatus.push(entry);
       // next line is because the status sheet uses commonName as the key
       enlirStatus[enlirStatus.length - 1].commonName = entry.name;
     }
   });
   return enlirStatus;
 };

/** sendRichEmbedStatus:
 * Processes and outputs information about a status effect in
 * RichEmbed format.
 * @param {object} result: the result from lookupStatus.
 * @param {object} msg: discord.js message object.
 * @return {object} Promise
 **/
function sendRichEmbedStatus(result, msg) {
  return new Promise( (fulfill, reject) => {
    statusEffect = result.value;
    let description = (statusEffect.effects !== undefined) ?
      (statusEffect.effects) : ('N/A');
    let defaultDuration = (statusEffect.defaultDuration !== undefined) ?
      (botUtils.returnDefaultDuration(statusEffect)) : ('N/A');
    let mndModifier = (statusEffect.mndModifier !== undefined) ?
      (returnMndModifier(statusEffect)) : ('N/A');
    let exclusiveStatus = (statusEffect.exclusiveStatus !== undefined) ?
      (returnExclusiveStatus(statusEffect)) : ('N/A');
    if (defaultDuration === 0) {
      defaultDuration = 'Until removed';
    };
    let multiplier = (statusEffect.multiplier !== undefined) ?
      (botUtils.returnMultiplier(statusEffect)) : ('N/A');
    let sb = (statusEffect.sb !== undefined) ?
      (statusEffect.sb) : (0);
    let time = (statusEffect.time !== undefined) ?
      (statusEffect.time) : ('N/A');
    let name = statusEffect.commonName;
    let notes = botUtils.returnNotes(statusEffect);
    let embed;
    if (notes !== undefined) {
      embed = new RichEmbed()
        .setTitle(name)
        .setDescription(description)
        .setColor('#8c42f4')
        .addField('Default duration', defaultDuration, true)
        .addField('MND modifier', mndModifier, true)
        .addField('Mutually-exclusive status effects', exclusiveStatus)
        .addField('Additional notes', notes);
    } else {
      embed = new RichEmbed()
        .setTitle(name)
        .setDescription(description)
        .setColor('#8c42f4')
        .addField('Multipler', multiplier)
        .addField('Soulbreak gauge charge', sb)
        .addField('Cast time', time);
    }
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
