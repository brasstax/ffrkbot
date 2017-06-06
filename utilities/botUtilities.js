const util = require('util');
const jsonQuery = require('json-query');
const titlecase = require('titlecase');

const fs = require('fs');
const path = require('path');

const enlirAbilitiesPath = path.join(__dirname, '..', 'enlir_json',
  'abilities.json');

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
  if (args.length < 1) {
    msg.reply('Usage: !ability Ability Name (no quotes needed)');
    return;
  };
  let query;
  query = titlecase.toLaxTitleCase(args);
  console.log(`Ability to lookup: ${query}`);
  console.log(util.format('.ability caller: %s#%s',
    msg.author.username, msg.author.discriminator));
  let queryString = util.format('[name=%s]', query);
  console.log(`queryString: ${queryString}`);
  let result = jsonQuery(queryString, {
    data: enlirAbilities,
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
  let message = util.format(
    '\nAbility name: %s\nDescription: %s\nMultiplier: %d\n' +
    'Element: %s\nType: %s\nTarget: %s\nSoul Break charge: %d\n' +
    'Cast time: %d',
    result.value.name,
    description,
    multiplier,
    element,
    result.value.school,
    result.value.target,
    result.value.sb,
    result.value.time);
  msg.channel.send(message);
};
