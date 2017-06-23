const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const rewire = require('rewire');
const assert = chai.assert;

const sinon = require('sinon');
const discord = require('discord.js');
const path = require('path');
const botUtilsPath = path.join(
  __dirname, '..', 'utilities', 'soulbreak-bot-utils.js');
const botUtils = rewire(botUtilsPath);

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
      botUtils.soulbreak(msg, query, sbType).then( () => {
        assert.equal(soulbreakSummarySpy.calledOnce, true);
      });
    });
    it('should send a plaintext summary of a character\'s soul breaks',
        () => {
          msg.channel.send = sandbox.stub().rejects(null);
          let query = 'tifa';
          let sbType = 'all';
          soulbreakSummarySpy = sandbox.spy(botUtils,
            'sendSoulbreakRichEmbedSummary');
          soulbreakPlaintextSpy = sandbox.spy(botUtils,
            'sendSoulbreakPlaintextSummary');
          botUtils.__set__({
            'sendSoulbreakRichEmbedSummary': soulbreakSummarySpy,
            'sendSoulbreakPlaintextSummary': soulbreakPlaintextSpy,
          });
          botUtils.soulbreak(msg, query, sbType).then( () => {
            assert.equal(soulbreakSummarySpy.calledOnce, true);
            assert.equal(soulbreakPlaintextSpy.calledOnce, true);
          });
      });
  });
});
