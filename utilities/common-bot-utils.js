const util = require('util');
const titlecase = require('titlecase');
const pad = require('pad');

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
