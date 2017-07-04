/** common-bot-utils.js
 * For potentially-common bot utilities.
 * If a function can be used in more than one command, put it here even
 * if its name references a specific command (ie the ability stuff here
 * can and has been used in soulbreak stuff.)
 **/
const util = require('util');
const titlecase = require('titlecase');
const pad = require('pad');
const path = require('path');
const fs = require('fs');
const aliasesPath = path.join(__dirname, 'aliases.json');
const aliasesFile = fs.readFileSync(aliasesPath);
const aliases = JSON.parse(aliasesFile);

/** returnDescription:
 * Checks the value of an ability or soulbreak's effects to see if
 * it's a string.
 * If the description is a string, return the string as the description.
 * Otherwise, take the formula and append it to the word "attack" to describe
 * it.
 * @param {object} ability: The ability or soulbreak to check.
 * @return {string} description
 **/
exports.returnDescription = function returnDescription(ability) {
  let description;
  if (typeof(ability.effects) !== 'string' || ability.effects === undefined) {
    description = util.format('%s Attack', ability.formula);
  } else {
    description = ability.effects;
  };
  return description;
};

/** returnMultiplier:
 * Checks the value of an ability's multiplier to see if it's a number.
 * If the multiplier is a number, return the number. Otherwise, return 0.
 * @param {object} ability: the abiity or soulbreak to check.
 * @return {number} multiplier
 **/
exports.returnMultiplier = function returnMultiplier(ability) {
  if (typeof(ability.multiplier) !== 'number' ||
    ability.multiplier === undefined) {
      return 0;
    } else {
      return ability.multiplier;
    };
};

/** returnElement:
 * Checks an ability's element to see if it's a string that doesn't begin
 * with a punctuation mark.
 * If the element is a string, return the element. Otherwise, return the
 * string 'None'.
 * @param {object} ability: the abiity or soulbreak to check.
 * @return {string} element
 **/
exports.returnElement = function returnElement(ability) {
  let re = /^\W/;
  if (ability.element === undefined || ability.element.match(re)) {
    return 'None';
  } else {
    return ability.element;
  };
};

/** returnPropertyString:
 * Takes an ability or soulbreak property and returns a more descriptive
 * string.
 * @param {string} property: The value of an ability or soulbreak property.
 * @param {string} description: What to call the ability or soulbreak in
 *  the output description.
 * @param {number} padLength: How much to pad the message by.
 * @return {string} propertyString
 * @example
 * // Returns 'Type: WHT        ' (note the eight spaces.)
 * returnPropertyString('WHT', 'Type', 8);
 * @example
 * // Returns 'Element: None' (no padding)
 * returnPropertyString('None', 'Element', 0);
 **/
exports.returnPropertyString = function returnPropertyString(property,
  description, padLength=0) {
  let propertyString = util.format('%s: %s', titlecase(description), property);
  if (padLength > 0) {
    propertyString = pad(propertyString, padLength);
  };
  return propertyString;
};

/** returnDefaultDuration:
 * Returns the default duration of a status effect.
 * @param {object} statusEffect: the status effect to check.
 * @return {number} duration
 **/
exports.returnDefaultDuration = function returnDefaultDuration(statusEffect) {
  let duration = (isNaN(Number(statusEffect.defaultDuration))) ?
    (0) : (Number(statusEffect.defaultDuration));
  // I have no idea why gsjson returns the defaultDuration as a string.
  return duration;
};

/** returnNotes:
 * Returns the notes of a status effect.
 * @param {object} statusEffect: the status effect to check.
 * @return {string} notes
 **/
exports.returnNotes = function returnNotes(statusEffect) {
  if (statusEffect.notes === '-') {
    return 'N/A';
  } else {
    return statusEffect.notes;
  };
};

/** returnImageLink:
 * Returns the URL link for an ability, soulbreak, legend materia, or
 * record materia.
 * @param {object} ability: a JSON dict of an ability, soulbreak, etc.
 * @param {string} abilityType: one of: ability, soulstrike, legend_materia,
 * or record_materia.
 * @return {string} uri: URI of the image, or a default Discord avatar image
 * if the image is not found.
 **/
exports.returnImageLink = function returnImageLink(ability, abilityType) {
  let baseUri = 'https://dff.sp.mbga.jp/dff/static/lang/image';
  let folder = abilityType;
  let defaultImage = 'https://cdn.discordapp.com/embed/avatars/0.png';
  let id = ability.id;
  if (isNaN(Number(id)) === true) {
    return defaultImage;
  };
  let px;
  if (folder === 'soulstrike') {
    px = 256;
  } else {
    px = 128;
  };
  let endpoint = util.format('%s/%s_%s.png', id, id, px);
  let fullUri = util.format('%s/%s/%s', baseUri, folder, endpoint);
  console.log(`fullUri for ${ability.name}: ${fullUri}`);
  return fullUri;
};
/** checkAlias:
 * Checks to see if an alias belongs to a character.
 * @param {String} alias: The alias to check.
 * @return {String} character: the character's name, or
 * @return {null} null: if no result found.
 **/
exports.checkAlias = function checkAlias(alias) {
  if (alias.toLowerCase() in aliases) {
    return aliases[alias.toLowerCase()];
  } else {
    return null;
  };
};
