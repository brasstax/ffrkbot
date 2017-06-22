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
  __dirname, '..', 'utilities', 'ability-bot-utils.js');
const jsonQuery = require('json-query');
const botUtils = rewire(botUtilsPath);
const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirAbilitiesPath = path.join(enlirJsonPath, 'abilities.json');
const enlirAbilitiesFile = fs.readFileSync(enlirAbilitiesPath);
const enlirAbilities = JSON.parse(enlirAbilitiesFile);

describe('ability', () => {
  let sandbox;
  let msg = sinon.createStubInstance(discord.Client);
  msg.author = sinon.createStubInstance(discord.User);
  msg.channel = sinon.createStubInstance(discord.TextChannel);
  msg.channel.send = sinon.stub().resolves(null);
  msg.author.username = null;
  msg.author.discriminator = null;
  describe('lookupAbility', () => {
    beforeEach( () => {
      sandbox = sinon.sandbox.create();
      stubEmbed = sandbox.stub(botUtils, 'sendRichEmbedAbility');
      stubPlaintext = sandbox.stub(botUtils, 'processAbility');
      botUtils.__set__({
        'sendRichEmbedAbility': stubEmbed,
        'processAbility': stubPlaintext,
      });
    });
    afterEach( () => {
      sandbox.restore();
    });
    let args = 'waterga';
    it('should call sendRichEmbedAbility', () => {
      stubEmbed.resolves(null);
      botUtils.ability(msg, args).then( () => {
        assert.equal(stubEmbed.calledOnce, true,
          'sendRichEmbedAbility was called once');
        assert.equal(stubPlaintext.notCalled, true,
          'processAbility should not be called');
      });
    });
    it('should call processAbility when sendRichEmbedAbility fails', () => {
          stubEmbed.rejects(null);
          botUtils.ability(msg, args)
            .then( () => {
            assert.equal(stubEmbed.calledOnce, true,
              'stubEmbed called once');
            assert.equal(stubPlaintext.calledOnce, true,
              'stubPlaintext called once');
            });
        });
  });
  describe('sendRichEmbedAbility', () => {
    it('Should construct and send a RichEmbedAbility', () => {
      let query = 'waterga';
      let queryString = util.format('[name~/%s/i]', query);
      let result = jsonQuery(queryString, {
        data: enlirAbilities,
        allowRegexp: true,
      });
      return botUtils.sendRichEmbedAbility(result, msg)
        .then( (res) => {
          assert.equal(res, null, 'sendRichEmbedAbility succeeded');
        }).catch( (err) => {
          assert.fail(err, null, `sendRichEmbedAbility should return null,` +
            ` but we got ${err}`);
        });
    });
  });
});
