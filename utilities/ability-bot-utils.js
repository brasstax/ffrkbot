const util = require('util');
const {RichEmbed} = require('discord.js');
const path = require('path');
const jsonQuery = require('json-query');
const titlecase = require('titlecase');
const escapeStringRegexp = require('escape-string-regexp');
const botUtils = require(path.join(__dirname, 'common-bot-utils.js'));

const fs = require('fs');

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirAbilitiesPath = path.join(enlirJsonPath, 'abilities.json');
const enlirAbilitiesFile = fs.readFileSync(enlirAbilitiesPath);
const enlirAbilities = JSON.parse(enlirAbilitiesFile);

/** lookupAbility:
 * Retrieves information about an ability.
 * @param {Object} msg: A message object from the Discord.js bot.
 * @param {Array} args: An array of arguments. This should only be
 * one value, and should contain only the following:
 *  * @param {String} abilityName: The desired ability name to look
 *    up. If the ability name has a space, the ability name should be
 *    encased in 'quotes'.
 * @return {Object} Promise
 **/
function lookupAbility(msg, args) {
  if (args.length < 3) {
    msg.reply('Search query must be at least three characters.');
    return;
  };
  let query;
  query = titlecase.toLaxTitleCase(args);
  query = escapeStringRegexp(query);
  console.log(`Ability to lookup: ${query}`);
  console.log(util.format('.ability caller: %s#%s',
    msg.author.username, msg.author.discriminator));
  let queryString = util.format('[name~/%s/i]', query);
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: enlirAbilities,
    allowRegexp: true,
  });
  if (result.value === null) {
    msg.channel.send(`Ability '${query}' not found.`);
  } else {
    return new Promise( (resolve, reject) => {
      sendRichEmbedAbility(result, msg)
        .then( (res) => {
          resolve(res);
        }).catch( (err) => {
          console.log(`Failed to call sendRichEmbedAbility, using plaintext`);
          try {
            processAbility(result, msg);
            resolve(err);
          } catch (e) {
            console.log(`Failed to call plaintext processAbility: ${e}`);
            reject(err);
          };
        });
      });
    };
};
/** processAbility:
 * Processes and outputs information about an ability.
 * @param {Object} result: A JSON list of a given ability.
 * @param {Object} msg: a discord.js message object.
 **/
function processAbility(result, msg) {
  ability = result.value;
  let description = botUtils.returnDescription(ability);
  let multiplier = botUtils.returnMultiplier(ability);
  let element = botUtils.returnElement(ability);
  let padLength = 20;
  let typeMsg = botUtils.returnPropertyString(
      ability.type, 'Type', padLength);
  let elementMsg = botUtils.returnPropertyString(element, 'Element');
  let targetMsg = botUtils.returnPropertyString(
    ability.target, 'Target', padLength);
  let multiplierMsg = botUtils.returnPropertyString(multiplier, 'Multiplier');
  let castMsg = botUtils.returnPropertyString(ability.time, 'Cast Time',
    padLength);
  let sbMsg = botUtils.returnPropertyString(ability.sb, 'Soul Break Charge');
  let message = (
    '**```\n' +
    util.format('%s\n', result.value.name) +
    util.format('%s\n', description) +
    util.format('%s || %s\n', typeMsg, elementMsg) +
    util.format('%s || %s\n', targetMsg, multiplierMsg) +
    util.format('%s || %s\n', castMsg, sbMsg) +
    '```**'
    );
  msg.channel.send(message);
};
/** sendRichEmbedAbility:
 * Processes and outputs information about an ability in RichEmbed format.
 * @param {object} result: the result from lookupAbility.
 * @param {object} msg: Discord.js-command message object.
 * @return {object} Promise
 **/
function sendRichEmbedAbility(result, msg) {
  ability = result.value;
  let description = botUtils.returnDescription(ability);
  let multiplier = botUtils.returnMultiplier(ability);
  let element = botUtils.returnElement(ability);
  let abilityType = ability.school;
  let target = ability.target;
  let castTime = ability.time;
  let sbCharge = ability.sb;
  let sbImage = botUtils.returnImageLink(ability, 'ability');
  let embed = new RichEmbed()
    .setTitle(ability.name)
    .setDescription(description)
    .setColor('#53ddff')
    .setThumbnail(sbImage)
    .addField('**Type**', abilityType, true)
    .addField('**Element**', element, true)
    .addField('**Target**', target, true)
    .addField('**Multiplier**', multiplier, true)
    .addField('**Cast Time**', castTime, true)
    .addField('**Soul Break Charge**', sbCharge, true);
  return new Promise( (res, err) => {
    msg.channel.send({embed})
      .then( (resolve) => {
        res(resolve);
      }).catch( (error) => {
        console.log(`error in sendRichEmbedAbility: ${error}`);
        err(error);
      });
  });
};

module.exports = {
  sendRichEmbedAbility: sendRichEmbedAbility,
  ability: lookupAbility,
  processAbility: processAbility,
};
