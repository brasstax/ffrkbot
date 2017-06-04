const util = require('util');
const https = require('https');
const jsonQuery = require('json-query');
const changeCase = require('change-case');

const baseApi = 'https://www.ffrkcentral.com/api/v1/';

// A good chunk of the commented-out stuff is there until I
// figure out how I want to deal with locally-saving the API
// results so I don't hit the API server all the time.

// const fs = require('fs');
// const path = require('path');

// const configPath = path.join(__dirname, '..', 'config.json');
// const dbConfigPath = path.join(__dirname, 'databases.json');
// const dbPath = path.join(__dirname, '..', 'ffrkcentral_data');

// const configFile = fs.readFileSync(configPath);
// const config = JSON.parse(configFile);
// const dbConfigFile = fs.readFileSync(dbConfigPath);
// const dbConfig = JSON.parse(dbConfigFile);

// let botAdmins = config.bot_admins;

/** parseMsg: parses a discord.js message into a primary command
 * and any arguments.
 * If a message starts with the msgPrefix defined ('!' in this case)
 * parseMsg will attempt to call the command via
 * global[command](msg, args).
 * The msg is needed as an argument in global[command] because it is
 * what actually replies to the Discord channel.
 * args is built with arguments after the initial command to support
 * submitting a command with arguments.
 *
 * This makes it easy to create commands by simply
 * creating a function called:
 *  global.<your_desired_command> = function <function_name>(msg, args) {
 *    // your function here
 *  }
 *
 * Examples:
 * In discord chat: !ping
 * Calls: global.ping function with no extra arguments.
 *  (Arguments are ignored.)
 *
 * In discord chat: !ability 'Banishing Strike'
 * Calls: global.ability function with 'Banishing Strike' as an argument.
 *
 * @param {Object} msg: A message object from the Discord.js bot.
 **/
exports.parseMsg = function(msg) {
  let msgPrefix = '!';
  if (msg.content.startsWith(msgPrefix)) {
    console.log(`msg.content: ${msg.content}`);
    let commandWithArgs = msg.content.split(' ');
    console.log(`commandWithArgs: ${commandWithArgs}`);
    // Creates the command, removes the msgPrefix
    let commandRaw = commandWithArgs[0].slice(1);
    let command = commandRaw.toLowerCase();
    let args = [];
    console.log(`command: ${command}`);
    if (commandWithArgs.shift().length > 0) {
      args = commandWithArgs.join(' ');
      args = changeCase.titleCase(args);
      console.log(`args: ${args}`);
    };
    console.log(util.format('caller: %s#%s',
      msg.author.username, msg.author.discriminator));
    try {
      global[command](msg, args);
    } catch (e) {
      console.log('Command does not exist: ' + command);
      console.log('Other errors: ' + e);
    };
  };
};

/** global.ping:
 * A simple function to see if the bot is working.
 * @param {Object} msg: A message object from the Discord.js bot.
 * @param {Array} args: an array of arguments. Not actually needed.
 *
 * In discord chat: !ping
 * Returns: a reply to the user with the word 'pong'.
 **/
global.ping = function ping(msg, args) {
  msg.reply('pong');
  return;
};


/** global.ability:
 * Retrieves information about an ability.
 * @param {Object} msg: A message object from the Discord.js bot.
 * @param {Array} args: An array of arguments. This should only be
 * one value, and should contain only the following:
 *  * @param {String} abilityName: The desired ability name to look
 *    up. If the ability name has a space, the ability name should be
 *    encased in 'quotes'.
 **/
global.ability = function lookupAbility(msg, args) {
  if (args.length < 1) {
    msg.reply('Usage: !ability Ability Name (no quotes needed)');
    return;
  };
  let query = args;
  console.log(`Ability to lookup: ${query}`);
  let endpoint = 'abilities';
  let url = util.format('%s%s', baseApi, endpoint);
  // https://stackoverflow.com/questions/31589288/passing-a-parameter-to-http-get-in-node-js
  let querySearch = downloadJson.bind(null, query, msg);
  https.get(url, querySearch);
};

/** global.update:
 * Updates the built-in FFRK databases from FFRKCentral.
 * Can only be called by botAdmins.
 * @param {Object} msg: A message object from the Discord.js bot.
 * @param {Array} args: Optionally, the desired database to update.
 * By default, updateDb will update all known databases:
 *  * abilities
 *  * characters
 *  * soul breaks
 *  * record materias
 *
 *  Databases are saved into the ffrkcentral_data folder.
 **/
/**
global.update = function updateDb(msg, args) {
  let userId = msg.author.id;
  if (botAdmins.indexOf(userId) === -1) {
    return;
  };
  let databases = ['abilities', 'characters', 'soul breaks'];
  if (args.length > 0) {
    let desiredDatabase = args[0];
    if (databases.indexOf(desiredDatabase) === -1) {
      msg.reply(
        utils.format('Database %s not found.', desiredDatabase));
      return;
    } else {
      databases = [desiredDatabase];
    };
  };
  databases.forEach( (database) => {
    download(database);
  });
};
**/

/** downloadJson:
 * Downloads a json and parses it into a JSON object.
 * @param {Object} query: HTTP response object.
 * @param {Object} msg: msg object.
 * @param {String} response: HTTP response object.
 **/
function downloadJson(query, msg, response) {
  const {statusCode} = response;
  const contentType = response.headers['content-type'];

  let error;
  if (statusCode != 200) {
    error = new Error(`Failed. Status code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error('Invalid content-type. ' +
        `Expected application/json but received ${contentType}`);
  }

  if (error) {
    console.error(error.message);
    // consume response data to free up memory
    response.resume();
    return;
  };

  response.setEncoding('utf8');
  let raw = '';

  response.on('data', (chunk) => {
    raw += chunk;
  });
  response.on('end', () => {
    try {
      const parsed = JSON.parse(raw);
      console.log(`parsed length: ${parsed.data.length}`);
      console.log(`msg.content in http.get: ${msg.content}`);
      let queryString = util.format('data[name=%s]', query);
      console.log(`queryString: ${queryString}`);
      let result = jsonQuery(queryString, {
        data: parsed,
      });
      if (result.value === null) {
        msg.channel.send(`Ability '${query}' not found.`);
      } else {
        msg.channel.send(`Ability name: ${result.value.name}
            Description: ${result.value.description}`);
      };
    } catch (e) {
      console.error(e.message);
    }
  });
};

/** save_download:
 * Downloads a file.
 * @param {String} url: URL of file to download.
 * @param {String} dest: Destination of file to save.
 * @param {Object} callback: callback object to call back.
 **/
/**
function download(url, dest, callback) {
  let file = fs.createWriteStream(dest);
  http.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(callback);
      });
  }).on('error', (error) => {
    fs.unlink(dest);
    if (callback) callback(error.message);
  });
};
**/
