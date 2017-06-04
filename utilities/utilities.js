exports.parseMsg = function(msg) {
  let msgPrefix = '!';
  if (msg.content.startsWith(msgPrefix)) {
    let msgLower = msg.content.toLowerCase();
    let commandWithArgs = msgLower.split(' ');
    let command = commandWithArgs[0];
    let args = [];
    if (commandWithArgs.shift().length() > 0) {
      args = commandWithArgs;
    };
  };
};
