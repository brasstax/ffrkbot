exports.parseMsg = function(msg) {
  let msgPrefix = '!';
  if (msg.content.startsWith(msgPrefix)) {
    let msgLower = msg.content.toLowerCase();
    let commandWithArgs = msgLower.split(' ');
    console.log('commandWithArgs: ' + commandWithArgs);
    let command = commandWithArgs[0].slice(1);
    let args = [];
    console.log('Command is ' + command);
    if (commandWithArgs.shift().length > 0) {
      args = commandWithArgs;
      console.log('Args are ' + args);
    };
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

