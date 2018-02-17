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
      return botUtils.soulbreak(msg, query, sbType).then( () => {
        assert.equal(soulbreakSummarySpy.calledOnce, true);
      });
    });
    it('should send a plaintext summary of a character\'s soul breaks',
        () => {
          msg.channel.send = sandbox.stub().rejects('method stubbed out');
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
          return botUtils.soulbreak(msg, query, sbType).catch( () => {
            assert.equal(soulbreakSummarySpy.calledOnce, true);
            assert.equal(soulbreakPlaintextSpy.calledOnce, true);
          });
      });
    it('should inform when search query is less than two letters', () => {
      let message = 'Character name must be at least two characters.';
      msg.channel.send = sandbox.stub().resolves(null);
      let query = 'b';
      return botUtils.soulbreak(msg, query, 'all').then( () => {
        assert.equal(msg.channel.send.calledOnce, true);
        assert.equal(msg.channel.send.calledWith(message), true);
      });
    });
    it('should inform when no results are found for a character', () => {
      let message = `No results for 'Foobar' 'all'.`;
      let query = 'foobar';
      msg.channel.send = sandbox.stub().resolves(null);
      return botUtils.soulbreak(msg, query, 'all').then( () => {
        assert.equal(msg.channel.send.calledOnce, true);
        assert.equal(msg.channel.send.calledWith(message), true);
      });
    });
    it('should inform when a user has not put in a valid SB type', () => {
      let message = 'Soulbreak type not one of: ' +
        'All, Default, SB, SSB, BSB, USB, OSB, CSB, FSB, UOSB, Glint, ASB.';
      msg.channel.send = sandbox.stub().resolves(null);
      let query = 'tifa';
      return botUtils.soulbreak(msg, query, 'aaaaaaa').then( () => {
        assert.equal(msg.channel.send.calledOnce, true);
        assert.equal(msg.channel.send.calledWith(message), true);
      });
    });
    it('should send one RichEmbed for a default soulbreak', () => {
      let query = 'tifa';
      msg.channel.send = sandbox.stub().resolves(null);
      return botUtils.soulbreak(msg, query, 'default').then( () => {
        assert.equal(msg.channel.send.calledOnce, true);
      });
    });
    it('should send multiple for characters with more than one SB', () => {
      let query = 'garnet';
      msg.channel.send = sandbox.stub().resolves(null);
      return botUtils.soulbreak(msg, query, 'BSB').then( () => {
        assert.isAbove(msg.channel.send.callCount, 1);
      });
    });
  });
});
