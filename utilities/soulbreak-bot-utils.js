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

const enlirSoulbreaksFile = fs.readFileSync(enlirSoulbreaksPath);
const enlirBsbCommandsFile = fs.readFileSync(enlirBsbCommandsPath);

const enlirSoulbreaks = JSON.parse(enlirSoulbreaksFile);
const enlirBsbCommands = JSON.parse(enlirBsbCommandsFile);

/** searchSoulbreak:
 * Searches and returns the soul breaks for a given character.
 * @param {string} character: the name of the character to search.
 * @param {string} sbType: The type of soul break to look up
 *  (one of: all, default, sb, bsb, usb, osb, csb, uosb,
  * asb, glint). Defaults to 'all'.
 * @return {object} Promise: a Promise with a result if resolved.
 **/
function searchSoulbreak(character, sbType='all') {
  console.log(`Character to lookup: ${character}`);
  console.log(`Soul break to return: ${sbType}`);
  character = escapeStringRegexp(character);
  // Backwards-compatibility with pre-localized fsb/uosb.
  if (sbType === 'fsb') {
    sbType = 'glint';
  }
  if (sbType === 'uosb') {
    sbType = 'asb';
  }
  let characterQueryString = util.format('[*character~/^%s$/i]', character);
  console.log(`characterQueryString: ${characterQueryString}`);
  return new Promise( (resolve, reject) => {
    try {
      let result;
      result = jsonQuery(characterQueryString, {
        data: enlirSoulbreaks,
        allowRegexp: true,
      });
      if (result.value.length === 0) {
        console.log(`No results found for ${character}, trying SB query.`);
        characterQueryString = util.format('[*name~/%s/i]', character);
        console.log(`characterQueryString sb search: ${characterQueryString}`);
        result = jsonQuery(characterQueryString, {
          data: enlirSoulbreaks,
          allowRegexp: true,
        });
        if (result.value.length === 0) {
          console.log('No results found.');
          resolve(result);
        };
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
    'bsb', 'usb', 'osb', 'csb', 'fsb', 'uosb', 'asb', 'glint'];
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
 *    (one of: all, default, sb, bsb, usb, osb, asb, glint, CSB,
 * fsb. Defaults to 'all'.)
 * @param {number} filterIndex: The index of the soulbreak to search for.
 * Savvy players can use this to refer to soulbreaks by number in approximate
 * release order, ie bsb1, asb1, glint2. Defaults to null so everything is
 * returned.
 *  @return {object} Promise
 **/
function lookupSoulbreak(msg, character, sbType, filterIndex=null) {
  console.log(util.format(',sb caller: %s#%s',
    msg.author.username, msg.author.discriminator));
  console.log(`Lookup called: ${character} ${sbType} ${filterIndex}`);
  return new Promise( (resolve, reject) => {
    if (character.length < 2) {
      msg.channel.send(
        'Character name must be at least two characters.')
        .then( (res) => {
          resolve(res);
        }).catch( (err) => {
          reject(err);
        });
      return;
    };
    if (checkSoulbreakFilter(sbType) === false) {
      msg.channel.send(
        'Soulbreak type not one of: ' +
          'All, Default, SB, SSB, BSB, USB, OSB, CSB, FSB, UOSB, Glint, ASB.')
        .then( (res) => {
          resolve(res);
        }).catch( (err) => {
          reject(err);
        });
      return;
    };
    console.log(`Alias check: ${botUtils.checkAlias(character)}`);
    if (botUtils.checkAlias(character) != null) {
      character = botUtils.checkAlias(character);
    };
    searchSoulbreak(character, sbType).then( (res) => {
      character = titlecase.toLaxTitleCase(character);
      if (res.value.length === 0) {
        msg.channel.send(`No results for '${character}' '${sbType}'.`)
        .then( (res) => {
          resolve(res);
        }).catch( (err) => {
          reject(err);
        });
        return;
      };
      let dm = false;
      let values = [];
      res.value.forEach( (value) => {
        values.push(value);
      });
      // If only one result from values, set sbType to the tier of the
      // the returned soulbreak.
      if (values.length === 1) {
        sbType = values[0].tier;
      }
      // Discord embed does not allow over 25 fields. Fail out if over 20
      // results.
      if (values.length > 20) {
        console.log('Over 20 results returned, informing user.');
        msg.channel.send(`Over 20 results for '${character}.' Please` +
        ` refine your search.`)
        .then( (res) => {
          resolve(res);
        }).catch( (err) => {
          reject(err);
        });
      }
      if (sbType === 'all') {
        console.log(`sending soulbreak summary`);
        sendSoulbreakRichEmbedSummary(values, msg)
          .then( (res) => {
            resolve(res);
          }).catch( (err) => {
            console.log(`Error sending richEmbed summary ${err}`);
            console.log(`Sending plaintext summary instead.`);
            sendSoulbreakPlaintextSummary(values, msg)
              .then( (res) => {
                resolve(res);
              }).catch( (err) => {
                console.log(`Error sending plaintext summary as well: ${err}`);
                reject(err);
            });
        });
      } else {
        if (filterIndex) {
          // Make a filterIndexActual because arrays start from 0.
          let filterIndexActual;
          filterIndexActual = Math.abs(filterIndex) - 1;
          if (filterIndexActual < 0) {
            filterIndexActual = 0;
          }
          console.log(filterIndexActual);
          let value = values[filterIndexActual];
          if (value === undefined) {
            let err = `${sbType}${filterIndex} not found for ${character}.`;
            err += ` Giving you all of ${character}'s ${sbType} instead.`;
            msg.channel.send(err)
              .then( () => {
              }).catch( (err) => {
                console.log(`Error sending error about unfound filterIndex.`);
            });
          } else {
            values = [];
            values.push(value);
          }
        }
        values.forEach( (value) => {
          sendRichEmbedSoulbreak(value, msg, dm, sbType).then( (result) => {
            result.forEach( (embed) => {
              msg.channel.send(embed)
                .then( () => {
                }).catch( (err) => {
                console.log(`Error calling sendRichEmbedSoulbreak: ${err}`);
              });
            });
          }).catch( () => {
            console.log(`Attempting to call plaintext soulbreak instead.`);
            processSoulbreak(value, msg, dm, character, sbType);
          });
          resolve();
        });
      };
    });
  });
};
/** checkSoulbreaksBelongToOne:
* checks to see if a list of soulbreaks belongs to one character.
* @param {object} soulbreaks: an array of soulbreaks.
* @param {string} character: the character to check against.
* @return {boolean}: soulbreaks either belong or don't belong to that character.
**/
function checkSoulbreaksBelongToOne(soulbreaks, character) {
  let check = true;
  soulbreaks.forEach( (soulbreak) => {
    if (soulbreak.character !== character) {
      check = false;
    };
  });
  return check;
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
  let embed;
  if (checkSoulbreaksBelongToOne(soulbreaks, character) === true) {
    embed = new RichEmbed()
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
    } else {
    embed = new RichEmbed()
      .setTitle(description)
      .setColor('#f44242');
    soulbreaks.forEach( (soulbreak) => {
      let character = soulbreak.character;
      let name = soulbreak.name;
      let description = botUtils.returnDescription(soulbreak);
      let tier = soulbreak.tier;
      let relic = soulbreak.relic;
      let nameField = util.format(
        '%s: %s (%s) {Relic: %s}', character, name, tier, relic);
      embed.addField(nameField, description);
    });
    };
  return new Promise( (resolve, reject) => {
    msg.channel.send({embed})
      .then( (res) => {
        resolve(res);
      }).catch( (error) => {
        console.log(`Couldn't send RichEmbed soulbreak summary: ${error}`);
        reject(error);
    });
  });
};
/** sendSoulbreakPlaintextSummary:
 * Sends a summary of a character's soulbreaks.
 * @param {array} soulbreaks: an array of soulbreaks.
 * @param {object} msg: the discord.js-commando message object.
 * @return {object} Promise
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
  return new Promise( (resolve, reject) => {
    msg.channel.send(message)
      .then( (res) => {
        resolve(res);
      }).catch( (error) => {
        console.log(`Couldn't send plaintext soulbreak summary: ${error}`);
        reject(error);
    });
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
  checkSoulbreaksBelongToOne: checkSoulbreaksBelongToOne,
};
