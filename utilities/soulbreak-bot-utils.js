const util = require('util');
const jsonQuery = require('json-query');
const titlecase = require('titlecase');
const pad = require('pad');
const escapeStringRegexp = require('escape-string-regexp');

const fs = require('fs');
const path = require('path');

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirSoulbreaksPath = path.join(enlirJsonPath, 'soulbreaks.json');
const enlirBsbCommandsPath = path.join(enlirJsonPath, 'bsbCommands.json');
const aliasesPath = path.join(__dirname, 'aliases.json');

const enlirSoulbreaksFile = fs.readFileSync(enlirSoulbreaksPath);
const enlirBsbCommandsFile = fs.readFileSync(enlirBsbCommandsPath);
const aliasesFile = fs.readFileSync(aliasesPath);

const enlirSoulbreaks = JSON.parse(enlirSoulbreaksFile);
const enlirBsbCommands = JSON.parse(enlirBsbCommandsFile);
const aliases = JSON.parse(aliasesFile);

/** searchSoulbreak:
 * Searches and returns the soul breaks for a given character.
 * @param {String} character: the name of the character to search.
 * @param {String} sbType: The type of soul break to look up
 *  (one of: all, default, sb, bsb, usb, osb). Defaults to 'all'.)
 * @return {Array} soulbreaks: An array of soulbreaks by name
 **/
function searchSoulbreak(character, sbType='all') {
  console.log(`Character to lookup: ${character}`);
  console.log(`Soul break to return: ${sbType}`);
  character = escapeStringRegexp(character);
  let characterQueryString = util.format('[*character~/^%s$/i]', character);
  console.log(`characterQueryString: ${characterQueryString}`);
  let result;
  result = jsonQuery(characterQueryString, {
    data: enlirSoulbreaks,
    allowRegexp: true,
  });
  if (result.value === null) {
    console.log('No results found.');
    return result;
  };
  if (sbType.toLowerCase() !== 'all') {
    let dataset = result.value;
    sbType = escapeStringRegexp(sbType);
    let tierQueryString = util.format('[*tier~/^%s$/i]', sbType);
    console.log(`tierQueryString: ${tierQueryString}`);
    result = jsonQuery(tierQueryString, {
      data: dataset,
      allowRegexp: true,
    });
  };
  console.log('Returning results.');
  return result;
};

/** checkSoulbreakFilter:
 *  Checks the soulbreak filter to see if it is a valid soulbreak type.
 *  @param {String} sbType: The soulbreak filter to check.
 *  @return {Boolean}: Valid or invalid soulbreak.
 **/
function checkSoulbreakFilter(sbType) {
  let possibleSbTypes = ['all', 'default', 'sb', 'ssb',
    'bsb', 'usb', 'osb', 'csb'];
  if (possibleSbTypes.indexOf(sbType.toLowerCase()) === -1) {
    return false;
  } else {
    return true;
  };
};

/** lookupSoulbreak:
 *  Runs searchSoulbreak to find a soul break for a given character.
 *  @param {Object} msg: A message object from the Discord.js bot.
 *  @param {String} character: the name of the character to search.
 *  @param {String} sbType: the type of soul break to search.
 *    (one of: all, default, sb, bsb, usb, osb). Defaults to 'all'.)
 **/
exports.soulbreak = function lookupSoulbreak(msg, character, sbType) {
  console.log(util.format(',sb caller: %s#%s',
    msg.author.username, msg.author.discriminator));
  console.log(`Lookup called: ${character} ${sbType}`);
  if (character.length < 3) {
    msg.channel.send(
      'Character name must be at least three characters.');
    return;
  };
  if (checkSoulbreakFilter(sbType) === false) {
    msg.channel.send(
      'Soulbreak type not one of: All, Default, SB, SSB, BSB, USB, OSB, CSB.');
    return;
  };
  console.log(`Alias check: ${checkAlias(character)}`);
  if (checkAlias(character) != null) {
    character = checkAlias(character);
  };
  let sbQueryResults = new Promise((resolve, reject) => {
    resolve(searchSoulbreak(character, sbType));
  });
  sbQueryResults.then( (resolve) => {
    character = titlecase.toLaxTitleCase(character);
    if (resolve.value.length === 0) {
      msg.channel.send(`No results for '${character}' '${sbType}'.`);
      return;
    };
    if (resolve.value.length > 5) {
      msg.channel.send(`Whoa there sparky, ${character} has like` +
        ` ${resolve.value.length} soulbreaks and I don't wanna spam` +
        ` the channel with more than 5 soulbreaks at a time.` +
        ` Filter by Default/SB/SSB/BSB/USB/OSB/CSB.`);
      return;
    };
    resolve.value.forEach( (value) => {
      // Holy heck I'll need to make this into its own function somehow.
      let element;
      if (value.element === undefined ||
          value.element === '-') {
        element = 'None';
      } else {
        element = value.element;
      };
      let padLength = 22;
      let typeMsg = pad(
        util.format('Type: %s', value.type),
        padLength);
      let elementMsg = util.format('Element: %s', element);
      let targetMsg = pad(
        util.format('Target: %s', value.target),
        padLength);
      let multiplier;
      if (typeof(value.multiplier) !== 'number') {
        multiplier = 0;
      } else {
        multiplier = value.multiplier;
      };
      let multiplierMsg = util.format('Multiplier: %s', multiplier);
      let castMsg = pad(
        util.format('Cast Time: %ds', value.time),
        padLength);
      let sbMsg = util.format('Soul Break Type: %s', value.tier);
      // remove sbMsg from castAndSbMsg if sbType is anything except 'all'
      let castAndSbMsg;
      if (sbType.toLowerCase() !== 'all') {
        castAndSbMsg = util.format('%s\n', castMsg);
      } else {
        castAndSbMsg = util.format('%s || %s\n', castMsg, sbMsg);
      };
      let description = value.effects;
      let message = (
        '**```\n' +
        util.format('%s: %s\n', character, value.name) +
        util.format('%s\n', description) +
        util.format('%s || %s\n', typeMsg, elementMsg) +
        util.format('%s || %s\n', targetMsg, multiplierMsg) +
        castAndSbMsg
        );
      // Append BSB commands if the command is a BSB
      if (checkBsb(value) === true) {
        console.log(`${value.name} is a burst soulbreak.`);
        message = message + 'BURST COMMANDS:\n';
        if (sbType.toLowerCase() === 'all') {
          message = message + '(Filter by BSB to see command details)\n';
        };
        // Let me tell you, I'm learning a lot about ES2015 Promises.
        let bsbQueryResults = new Promise( (resolve, reject) => {
          resolve(searchBsbCommands(value.name));
        });
        bsbQueryResults.then( (bsbCommandResults) => {
          bsbCommandResults.value.forEach( (bsbCommand) => {
            let command = bsbCommand.name;
            console.log(`Command ${command} found.`);
            let target = bsbCommand.target;
            let description = bsbCommand.effects;
            let element = bsbCommand.element;
            let castTime = bsbCommand.time;
            let sbCharge = bsbCommand.sb;
            let type = bsbCommand.school;
            let multiplier = bsbCommand.multiplier;
            let padLength = 21;
            let targetMsg = pad(
              util.format('Target: %s', target),
              padLength);
            let typeMsg = pad(
              util.format('Type: %s', type),
              padLength);
            let elementMsg = util.format('Element: %s', element);
            if (typeof(multiplier) !== 'number') {
              multiplier = 0;
            };
            let castMsg = pad(
              util.format('Cast Time: %ds', castTime),
              padLength);
            let sbMsg = util.format('Soul Break Charge: %d', sbCharge);
            let multiplierMsg = util.format('Multiplier: %s', multiplier);
            message = (
              message +
              util.format('*%s (%s)\n', command, description)
              );
            if (sbType.toUpperCase() === 'BSB') {
              message = (
                message +
                util.format('-%s || %s\n', typeMsg, elementMsg) +
                util.format('-%s || %s\n', targetMsg, multiplierMsg) +
                util.format('-%s || %s\n\n', castMsg, sbMsg)
              );
            };
            console.log(`message: ${message}`);
          });
          message = message + '```**';
          msg.channel.send(message);
        }).catch( (reject) => {
          console.log(`Error in bsbQueryResults: ${reject}`);
        });
      } else {
        message = message + '```**';
        msg.channel.send(message);
      };
    });
  }).catch( (reject) => {
    console.log(`Error in sbQueryResults. Error: ${reject}`);
  });
  return;
};

/** checkAlias:
 * Checks to see if an alias belongs to a character.
 * @param {String} alias: The alias to check.
 * @return {String} character: the character's name, or
 * @return {null} null: if no result found.
 **/
function checkAlias(alias) {
  if (alias.toLowerCase() in aliases) {
    return aliases[alias.toLowerCase()];
  } else {
    return null;
  };
};
/** checkBsb:
 * Checks to see if a given SB is a BSB.
 * @param {Dict} sb: The soulbreak to check.
 * @return {Boolean}: true if it's a BSB, false if not.
 **/
function checkBsb(sb) {
  console.log(`Checking if ${sb.name} is a BSB`);
  let result = (sb.tier.toUpperCase() === 'BSB') ? (true) : (false);
  return result;
};

/** searchBsbCommands:
 * Searches Enlir's BSB database for BSB commands by name.
 * @param {String} sb: The SB name to search.
 * @return {Array} bsb: An array of BSBs, if any.
 **/
function searchBsbCommands(sb) {
  let bsbQuery = util.format('[*source=%s]', sb);
  let results = jsonQuery(bsbQuery, {
    data: enlirBsbCommands,
  });
  console.log(`bsbQuery results: ${results.value}`);
  return results;
};
