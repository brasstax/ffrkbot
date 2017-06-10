const util = require('util');
const jsonQuery = require('json-query');
const titlecase = require('titlecase');
const pad = require('pad');
const escapeStringRegexp = require('escape-string-regexp');

const fs = require('fs');
const path = require('path');

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirAbilitiesPath = path.join(enlirJsonPath, 'abilities.json');
const enlirAbilitiesFile = fs.readFileSync(enlirAbilitiesPath);
const enlirAbilities = JSON.parse(enlirAbilitiesFile);

/** exports.ability:
 * Retrieves information about an ability.
 * @param {Object} msg: A message object from the Discord.js bot.
 * @param {Array} args: An array of arguments. This should only be
 * one value, and should contain only the following:
 *  * @param {String} abilityName: The desired ability name to look
 *    up. If the ability name has a space, the ability name should be
 *    encased in 'quotes'.
 **/
exports.ability = function lookupAbility(msg, args) {
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
    processAbility(result, msg);
  };
};
/** processAbility:
 * Processes and outputs information about an ability.
 * @param {Object} result: A JSON list of a given ability.
 * @param {Object} msg: a discord.js message object.
 **/
function processAbility(result, msg) {
  let description;
  if (result.value.effects === undefined) {
    description = util.format('%s Attack', result.value.formula);
  } else {
    description = result.value.effects;
  };
  let multiplier;
  if (result.value.multiplier === undefined) {
    multiplier = 0;
  } else {
    multiplier = result.value.multiplier;
  };
  let element;
  if (result.value.element === undefined ||
      result.value.element === '-') {
    element = 'None';
  } else {
    element = result.value.element;
  };
  let padLength = 20;
  let typeMsg = pad(
    util.format('Type: %s', result.value.school),
    padLength);
  let elementMsg = util.format('Element: %s', element);
  let targetMsg = pad(
    util.format('Target: %s', result.value.target),
    padLength);
  let multiplierMsg = util.format('Multiplier: %s', multiplier);
  let castMsg = pad(
    util.format('Cast Time: %ds', result.value.time),
    padLength);
  let sbMsg = util.format('Soul Break Charge: %d', result.value.sb);
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
