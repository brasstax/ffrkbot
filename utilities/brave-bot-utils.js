const util = require('util');
const {RichEmbed} = require('discord.js');
const jsonQuery = require('json-query');
const titlecase = require('titlecase');
const escapeStringRegexp = require('escape-string-regexp');

const fs = require('fs');
const path = require('path');
const botUtils = require(path.join(__dirname, 'common-bot-utils.js'));

const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirBraveCommandsPath = path.join(enlirJsonPath, 'braveCommands.json');

const enlirBraveCommandsFile = fs.readFileSync(enlirBraveCommandsPath);

const enlirBraveCommands = JSON.parse(enlirBraveCommandsFile);

/** searchBrave:
  * Searches for a given brave command and returns it.
  * @param {String} character: the character name.
  * @param {Integer} braveLevel: the brave level to look up.
  *   If null, returns all.
  * @return {Object} Promise
**/
function searchBrave(character, braveLevel=-1) {
  console.log(`Brave character: ${character}`);
  console.log(`Brave level: ${braveLevel}`);
  character = escapeStringRegexp(character);
  let characterQueryString = util.format('[*character~/^%s$/i]', character);
  console.log(`characterQueryString: ${characterQueryString}`);
  return new Promise((resolve, reject) => {
    try {
      result = jsonQuery(characterQueryString, {
        data: enlirBraveCommands,
        allowRegexp: true,
      });
      console.log(result.value);
      console.log(result.value.length);
      if (result.value.length === 0) {
        console.log(`No characters found for ${character}, trying a query for` +
          ` Source instead.`);
        characterQueryString = util.format('[*source~/^%s$/i]', character);
        result = jsonQuery(characterQueryString, {
          data: enlirBraveCommands,
          allowRegexp: true,
        });
        if (result.value.length === 0) {
            console.log(
              `No characters found for ${character}, trying a query for` +
              ` brave name instead.`);
          };
          characterQueryString = util.format('[*name~/^%s$/i]', character);
          result = jsonQuery(characterQueryString, {
            data: enlirBraveCommands,
            allowRegexp: true,
          });
      };
      if (result.value.length === 0) {
        console.log(`No results found.`);
        resolve(result);
        return;
      };
      if (braveLevel > -1 && braveLevel <= 3) {
        // We still want to return a list, even if it's a single object,
        // for maximum compatability.
        result.value = [result.value[braveLevel]];
      }
      resolve(result);
      return;
    } catch (error) {
      console.log(`Error in searchBrave: ${error}`);
      reject(error);
      return;
    }
  });
}

/** lookupBrave:
  * Searches for a given brave command and returns it to Discord.
  * @param {Object} msg: Discord-js.commando message.
  * @param {String} character: character name to look up.
  * @param {Integer} braveLevel: the brave level to look up. Optional.
  * @return {Object} Promise
  */
function lookupBrave(msg, character, braveLevel) {
  console.log(
    `,brave caller: ${msg.author.username}#${msg.author.discriminator}`
  );
  console.log(`lookup called: ${character} level ${braveLevel}`);
  return new Promise( (resolve, reject) => {
    if (character.length < 2) {
      msg.channel.send('Character name must be at least two characters.')
      .then( (res) => {
        resolve(res);
      }).catch( (err) => {
        reject(err);
      });
      return;
    };
    if (braveLevel < -1) {
      msg.channel.send('Brave level must be greater than or equal to 0.')
      .then( (res) => {
        resolve(res);
      }).catch( (err) => {
        reject(err);
      });
      return;
    };
    if (braveLevel > 3) {
      msg.channel.send('Brave level must be less than or equal to 3.')
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
    searchBrave(character, braveLevel).then( (res) => {
      character = titlecase.toLaxTitleCase(character);
      if (res.value.length === 0) {
        msg.channel.send(`No results found for '${character}'.`)
        .then( (res) => {
          resolve(res);
        }).catch( (err) => {
          reject(err);
        });
        return;
      }
      let values = [];
      console.log(res.value);
      res.value.forEach( (value) => {
        values.push(value);
      });
      values.forEach( (value) => {
        sendRichEmbedBrave(value, msg).then( (result) => {
          result.forEach( (embed) => {
            msg.channel.send(embed)
              .then( (res) => {
                resolve(res);
              }).catch( (err) => {
                reject(err);
              });
          });
        });
      });
    });
  });
}

/** sendRichEmbedBrave:
  * Processes and outputs information about a brave command.
  * @param {object} value: each value from lookupBrave results.
  * @param {object} msg: Discord.js-command message object.
  * @return {object} Promise
  */
function sendRichEmbedBrave(value, msg) {
  let embeds = [];
  let name = value.name;
  let description = botUtils.returnDescription(value);
  let multiplier = botUtils.returnMultiplier(value);
  let element = botUtils.returnElement(value);
  let castTime = value.time;
  let target = value.target;
  let character = value.character;
  let source = value.source;
  let level = value.brave;
  let image = botUtils.returnBraveImage(level);
  let title = `${name}: Level ${level}`;
  let embed = new RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor('#43ddff')
    .setThumbnail(image)
    .addField('**Character**', character, true)
    .addField('**Element**', element, true)
    .addField('**Multiplier**', multiplier, true)
    .addField('**Cast Time**', castTime, true)
    .addField('**Target**', target, true)
    .addField('**Source**', source, true);
  embeds.push(embed);
  return new Promise( (resolve, reject) => {
    try {
      resolve(embeds);
    } catch (err) {
      console.log(`Error in sendRichEmbedBrave: ${err}`);
      reject(err);
    };
  });
}
exports.braveLookup = lookupBrave;
