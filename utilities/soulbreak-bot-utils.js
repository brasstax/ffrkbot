const util = require('util');
const {RichEmbed} = require('discord.js');
const jsonQuery = require('json-query');
const titlecase = require('titlecase');
const escapeStringRegexp = require('escape-string-regexp');

const fs = require('fs');
const path = require('path');
const botUtils = require(path.join(__dirname, 'common-bot-utils.js'));

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
 * @param {string} character: the name of the character to search.
 * @param {string} sbType: The type of soul break to look up
 *  (one of: all, default, sb, bsb, usb, osb). Defaults to 'all'.)
 * @return {object} Promise: a Promise with a result if resolved.
 **/
function searchSoulbreak(character, sbType='all') {
  console.log(`Character to lookup: ${character}`);
  console.log(`Soul break to return: ${sbType}`);
  character = escapeStringRegexp(character);
  let characterQueryString = util.format('[*character~/^%s$/i]', character);
  console.log(`characterQueryString: ${characterQueryString}`);
  return new Promise( (resolve, reject) => {
    try {
      let result;
      result = jsonQuery(characterQueryString, {
        data: enlirSoulbreaks,
        allowRegexp: true,
      });
      if (result.value === null) {
        console.log('No results found.');
        resolve(result);
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
      console.log(`Returning results: ${result.value.length}`);
      resolve(result);
    } catch (error) {
      console.log(`Error in searchSoulbreak: ${error}`);
      reject(error);
    };
  });
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
function lookupSoulbreak(msg, character, sbType) {
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
  let sbQueryResults = searchSoulbreak(character, sbType);
  sbQueryResults.then( (resolve) => {
    console.log(`calling sbQueryResults.`);
    character = titlecase.toLaxTitleCase(character);
    if (resolve.value.length === 0) {
      msg.channel.send(`No results for '${character}' '${sbType}'.`);
      return;
    };
    let dm = false;
    let values = [];
    resolve.value.forEach( (value) => {
      values.push(value);
    });
    if (sbType === 'all') {
      console.log(`sending soulbreak summary`);
      sendSoulbreakRichEmbedSummary(values, msg).catch( (err) => {
        console.log(`Error sending richEmbed summary ${err}`);
        sendSoulbreakPlaintextSummary(values, msg);
      });
    } else {
      values.forEach( (value) => {
        let sbResults = sendRichEmbedSoulbreak(value, msg, dm, sbType);
        sbResults.then( (result) => {
          result.forEach((embed) => {
            msg.channel.send(embed);
          });
        }).catch( (err) => {
            console.log(`Error calling sendRichEmbedSoulbreak: ${err}`);
            processSoulbreak(value, msg, dm, character, sbType);
        });
      });
    };
  return;
  });
};
/** sendSoulbreakRichEmbedSummary:
 * Sends a summary of a character's soulbreaks as a RichEmbed object.
 * @param {array} soulbreaks: an array of soulbreaks.
 * @param {object} msg: the discord.js-commando message object.
 * @return {object} Promise
 **/
function sendSoulbreakRichEmbedSummary(soulbreaks, msg) {
  let character = soulbreaks[0].character;
  let description = 'SOULBREAK SUMMARY (use filters for details)';
  let embed = new RichEmbed()
    .setTitle(character)
    .setDescription(description)
    .setColor('#f44242');
  soulbreaks.forEach( (soulbreak) => {
    let name = soulbreak.name;
    let description = botUtils.returnDescription(soulbreak);
    let tier = soulbreak.tier;
    let relic = soulbreak.relic;
    let nameField = util.format('%s (%s) {Relic: %s}', name, tier, relic);
    embed.addField(nameField, description);
  });
  return new Promise( (resolve, reject) => {
    msg.channel.send({embed})
      .then( (res) => {
        resolve(res);
      }).catch( (error) => {
        console.log(`Couldn't send RichEmbed soulbreak summary: ${error}` +
          `, sending plaintext summary instead`);
        reject(error);
    });
  });
};
/** sendSoulbreakPlaintextSummary:
 * Sends a summary of a character's soulbreaks.
 * @param {array} soulbreaks: an array of soulbreaks.
 * @param {object} msg: the discord.js-commando message object.
 **/
function sendSoulbreakPlaintextSummary(soulbreaks, msg) {
  let message = '**```\n';
  let character = soulbreaks[0].character;
  message = message + character + '\n';
  message = message +
    'SOULBREAK SUMMARY (use filters for details)\n\n';
  soulbreaks.forEach( (soulbreak) => {
    let name = soulbreak.name;
    let description = botUtils.returnDescription(soulbreak);
    let tier = soulbreak.tier;
    let relic = soulbreak.relic;
    let nameMsg = name;
    let descMsg = description;
    let tierMsg = util.format('(%s)', tier);
    let relicMsg = util.format('{Relic: %s}', relic);
    nameMsg = util.format('%s %s %s\n', nameMsg, tierMsg, relicMsg);
    descMsg = descMsg + '\n';
    message = message + nameMsg + descMsg + '\n';
  });
  message = message + '```**';
  msg.channel.send(message)
    .catch( (error) => {
      console.log(`Couldn't send plaintext soulbreak summary because ${error}`);
  });
};
/** sendRichEmbedSoulbreak:
 * Processes and outputs information about a soulbreak in RichEmbed format.
 * @param {object} soulbreak: each value from lookupSoulbreak results.
 * @param {object} msg: Discord.js-commando message object.
 * @param {boolean} dm: whether to DM the user.
 * @param {string} sbType: the SB to filter and display.
 * @return {object} Promise
 **/
function sendRichEmbedSoulbreak(soulbreak, msg, dm=false, sbType='all') {
  let embeds = [];
  let name = soulbreak.name;
  let description = botUtils.returnDescription(soulbreak);
  let multiplier = botUtils.returnMultiplier(soulbreak);
  let element = botUtils.returnElement(soulbreak);
  let character = soulbreak.character;
  let relic = soulbreak.relic;
  let title = util.format('%s: %s {Relic: %s}', character, name, relic);
  let skillType = soulbreak.type;
  let castTime = soulbreak.time;
  let target = soulbreak.target;
  let sbTier = soulbreak.tier;
  let sbImage = botUtils.returnImageLink(soulbreak, 'soulstrike');
  let embed = new RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor('#53ddff')
    .setThumbnail(sbImage)
    .addField('**Type**', skillType, true)
    .addField('**Element**', element, true)
    .addField('**Target**', target, true)
    .addField('**Multiplier**', multiplier, true)
    .addField('**Cast Time**', castTime, true);
  if (sbType !== 'all') {
    embed.addField('**Soul Break Type**', sbTier, true);
  };
  embeds.push({embed});
  if (checkBsb(soulbreak) === true) {
    console.log(`${name} is a burst soulbreak.`);
    let bsbQueryResults = searchBsbCommands(name);
    bsbQueryResults.then( (bsbCommands) => {
      bsbCommands.value.forEach( (bsbCommand) => {
          embed = processRichEmbedBsb(bsbCommand, embed);
          embeds.push({embed});
      });
    }).catch( (error) => {
      console.log(`Error processing RichEmbed BSB, error ${error}`);
    });
  };
  return new Promise( (resolve, reject) => {
    try {
      resolve(embeds);
    } catch (err) {
      console.log(`Error in sendRichEmbedSoulbreak, error: ${err}`);
      reject(err);
    };
  });
};

/** processRichEmbedBsb:
 * Adds BSB commands to an embed message.
 * @param {object} bsbCommand: a JSON dict for a BSB command.
 * @return {object} embed: a RichEmbed() message.
 **/
function processRichEmbedBsb(bsbCommand) {
  let command = bsbCommand.name;
  console.log(`Command ${command} found for processRichEmbedBsb.`);
  let target = bsbCommand.target;
  let source = bsbCommand.source;
  let description = botUtils.returnDescription(bsbCommand);
  let element = botUtils.returnElement(bsbCommand);
  let castTime = bsbCommand.time;
  let sbCharge = bsbCommand.sb;
  let sbImage = botUtils.returnImageLink(bsbCommand, 'ability');
  let type = bsbCommand.school;
  let multiplier = botUtils.returnMultiplier(bsbCommand);
  let embed = new RichEmbed()
    .setTitle(util.format('**%s BSB Command: %s**', source, command))
    .setDescription(description)
    .setColor('#ea9f3c')
    .setThumbnail(sbImage)
    .addField('**Type**', type, true)
    .addField('**Element**', element, true)
    .addField('**Target**', target, true)
    .addField('**Multiplier**', multiplier, true)
    .addField('**Cast Time**', castTime, true)
    .addField('**Soul Break Charge**', sbCharge, true);
  if (command.includes('(S)')) {
    embed.setColor('#4cff3f');
  };
  return embed;
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
 * @param {string} sb: The SB name to search.
 * @return {object} Promise: results of search if resolved.
 **/
function searchBsbCommands(sb) {
  let bsbQuery = util.format('[*source=%s]', sb);
  return new Promise( (resolve, reject) => {
    try {
      let results = jsonQuery(bsbQuery, {
        data: enlirBsbCommands,
      });
      console.log(`bsbQuery results: ${results.value.length}`);
      resolve(results);
    } catch (error) {
      console.log(`bsbQuery failed, reason: ${error}`);
      reject(error);
    }
  });
};

/** processSoulbreak:
 * Takes JSON about a soulbreak and outputs info in plaintext.
 * @param {object} soulbreak: a JSON dict returned from searchSoulbreak.
 * @param {object} msg: a discord.js-commando Message object.
 * @param {boolean} dm: Whether to DM the user the information.
 * @param {string} character: the character to search.
 * @param {string} sbType: The soulbreak filter to use.
 **/
function processSoulbreak(soulbreak, msg, dm=false, character, sbType='all') {
  console.log(`dm: ${dm}`);
  let name = soulbreak.name;
  let element = botUtils.returnElement(soulbreak);
  let relic = soulbreak.relic;
  let pad = 22;
  let skillType = soulbreak.type;
  let target = soulbreak.target;
  let castTime = soulbreak.time;
  let multiplier = botUtils.returnMultiplier(soulbreak);
  let sbTier = soulbreak.tier;
  let typeMsg = botUtils.returnPropertyString(
    skillType, 'Type', pad);
  let elementMsg = botUtils.returnPropertyString(element, 'Element');
  let targetMsg = botUtils.returnPropertyString(
    target, 'Target', pad);
  let multiplierMsg = botUtils.returnPropertyString(
    multiplier, 'Multiplier');
  let castMsg = botUtils.returnPropertyString(
    castTime, 'Cast Time', pad);
  let sbMsg = botUtils.returnPropertyString(sbTier, 'Soul Break Type');
  // remove sbMsg from castAndSbMsg if sbType is anything except 'all'
  let castAndSbMsg;
  if (sbType.toLowerCase() !== 'all') {
    castAndSbMsg = util.format('%s\n', castMsg);
  } else {
    castAndSbMsg = util.format('%s || %s\n', castMsg, sbMsg);
  };
  let description = botUtils.returnDescription(soulbreak);
  let message = (
    '**```\n' +
    util.format('%s: %s {Relic: %s}\n', character, name, relic) +
    util.format('%s\n', description) +
    util.format('%s || %s\n', typeMsg, elementMsg) +
    util.format('%s || %s\n', targetMsg, multiplierMsg) +
    castAndSbMsg
    );
  // Append BSB commands if the command is a BSB
  if (checkBsb(soulbreak) === true) {
    console.log(`${soulbreak.name} is a burst soulbreak.`);
    message = message + 'BURST COMMANDS:\n';
    if (sbType.toLowerCase() === 'all') {
      message = message + '(Filter by BSB to see command details)\n';
    };
    // Let me tell you, I'm learning a lot about ES2015 Promises.
    let bsbQueryResults = searchBsbCommands(soulbreak.name);
    bsbQueryResults.then( (bsbCommandResults) => {
      bsbCommandResults.value.forEach( (bsbCommand) => {
        message = processBsb(bsbCommand, message, sbType);
        console.log(`message: ${message}`);
      });
      message = message + '```**';
      if (dm === true) {
        console.log(`msg.author: ${msg.author}`);
        msg.author.send(message);
      } else {
        msg.channel.send(message);
      };
    }).catch( (reject) => {
      console.log(`Error in bsbQueryResults: ${reject}`);
    });
  } else {
    message = message + '```**';
    if (dm === true) {
      console.log(`msg.author: ${msg.author}`);
      msg.author.send(message);
    } else {
      msg.channel.send(message);
    };
  };
};

/** processBsb:
 * Takes a BSB command and outputs a message block for it.
 * @param {object} bsbCommand: a JSON dict for a BSB command.
 * @param {string} message: Passed from processSoulbreak, the
 *  current version of the message with entry effects and
 *  SB attributes.
 * @param {string} sbType: the soul break filter.
 * @return {string} message: the complete message including
 *  the attributes for the soul break commands.
 **/
function processBsb(bsbCommand, message=null, sbType='all') {
  let command = bsbCommand.name;
  console.log(`Command ${command} found.`);
  let target = bsbCommand.target;
  let description = botUtils.returnDescription(bsbCommand);
  let element = botUtils.returnElement(bsbCommand);
  let castTime = bsbCommand.time;
  let sbCharge = bsbCommand.sb;
  let type = bsbCommand.school;
  let multiplier = botUtils.returnMultiplier(bsbCommand);
  let pad = 21;
  let targetMsg = botUtils.returnPropertyString(
    target, 'Target', pad);
  let typeMsg = botUtils.returnPropertyString(type, 'Type', pad);
  let elementMsg = botUtils.returnPropertyString(element, 'Element');
  let castMsg = botUtils.returnPropertyString(
    castTime, 'Cast Time', pad);
  let sbMsg = botUtils.returnPropertyString(
    sbCharge, 'Soul Break Charge');
  let multiplierMsg = botUtils.returnPropertyString(
    multiplier, 'Multiplier');
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
  return message;
};

module.exports = {
  sendSoulbreakRichEmbedSummary: sendSoulbreakRichEmbedSummary,
  soulbreak: lookupSoulbreak,
  searchSoulbreak: searchSoulbreak,
  sendSoulbreakPlaintextSummary: sendSoulbreakPlaintextSummary,
};
