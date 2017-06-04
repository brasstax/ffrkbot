const util = require('util');

exports.parseMsg = function(msg) {
  let msgPrefix = '!';
  if (msg.content.startsWith(msgPrefix)) {
    let msgLower = msg.content.toLowerCase();
    let commandWithArgs = msgLower.split(' ');
    console.log(util.format('commandWithArgs: %s', commandWithArgs));
    // Creates the command, removes the msgPrefix
    let command = commandWithArgs[0].slice(1);
    let args = [];
    console.log(util.format('command: %s', command));
    if (commandWithArgs.shift().length > 0) {
      args = commandWithArgs;
      console.log(util.format('args: %s', args));
    };
    console.log(util.format('caller: %s#%s',
      msg.author.username, msg.author.discriminator));
    try {
      global[command](msg, args);
    } catch (e) {
      console.log('Command does not exist: ' + command);
    };
  };
};

global.ping = function ping(msg, args) {
  msg.reply('pong');
  return;
};

