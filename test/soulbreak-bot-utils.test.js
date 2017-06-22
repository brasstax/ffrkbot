const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const rewire = require('rewire');
const assert = chai.assert;

const sinon = require('sinon');
const discord = require('discord.js');
const path = require('path');
const util = require('util');
const fs = require('fs');
const botUtilsPath = path.join(
  __dirname, '..', 'utilities', 'soulbreak-bot-utils.js');
const jsonQuery = require('json-query');
const botUtils = rewire(botUtilsPath);
const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirSoulbreaksPath = path.join(enlirJsonPath, 'soulbreaks.json');
const enlirSoulbreaksFile = fs.readFileSync(enlirSoulbreaksPath);
const enlirSoulbreaks = JSON.parse(enlirSoulbreaksFile);
const enlirBsbCommandsPath = path.join(enlirJsonPath, 'bsbCommands.json');
const enlirBsbCommandsFile = fs.readFileSync(enlirBsbCommandsPath);
const enlirBsbCommands = JSON.parse(enlirBsbCommandsFile);

describe('soulbreak bot utils testing', () => {
  let sandbox;
  let msg = sinon.createStubInstance(discord.Client);
  msg.author = sinon.createStubInstance(discord.User);
  msg.channel = sinon.createStubInstance(discord.TextChannel);
  msg.author.username = null;
  msg.author.discriminator = null;
  describe('lookupSoulbreak', () => {
    beforeEach( () => {
      sandbox = sinon.sandbox.create();
    });
    afterEach( () => {
      sandbox.restore();
    });
    it('should send a summary of a character\'s soul break', () => {
      msg.channel.send = sandbox.stub().resolves(null);
      let query = 'cloud';
      let sbType = 'all';
      soulbreakSummarySpy = sandbox.spy(botUtils,
        'sendSoulbreakRichEmbedSummary');
      botUtils.__set__('sendSoulbreakRichEmbedSummary',
        soulbreakSummarySpy);
      botUtils.soulbreak(msg, query, sbType);
      assert.equal(soulbreakSummarySpy.calledOnce, true);
    });
  });
});
