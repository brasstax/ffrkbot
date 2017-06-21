const chai = require('chai');
const assert = chai.assert;

const sinon = require('sinon');
const discord = require('discord.js');
const path = require('path');
const util = require('util');
const fs = require('fs');
const botUtilsPath = path.join(
  __dirname, '..', 'utilities', 'ability-bot-utils.js');
const jsonQuery = require('json-query');
const botUtils = require(botUtilsPath);
const enlirJsonPath = path.join(__dirname, '..', 'enlir_json');
const enlirAbilitiesPath = path.join(enlirJsonPath, 'abilities.json');
const enlirAbilitiesFile = fs.readFileSync(enlirAbilitiesPath);
const enlirAbilities = JSON.parse(enlirAbilitiesFile);

describe('ability', () => {
  describe('ability call', () => {
    it('Should call sendRichEmbedAbility', () => {
      let msg = sinon.createStubInstance(discord.Client);
      msg.author = sinon.createStubInstance(discord.User);
      msg.channel = sinon.createStubInstance(discord.TextChannel);
      msg.channel.send = sinon.stub().resolves(null);
      msg.author.username = null;
      msg.author.discriminator = null;
      let stub = sinon.stub(botUtils, 'sendRichEmbedAbility');
      stub.resolves(null);
      let args = 'waterga';
      res = botUtils.ability(msg, args);
      assert.equal(res, null, 'ability called sendRichEmbedAbility');
    });
  });
  describe('sendRichEmbedAbility', () => {
    it('Should construct and send a RichEmbedAbility', () => {
      let msg = sinon.createStubInstance(discord.Client);
      msg.channel = sinon.createStubInstance(discord.TextChannel);
      msg.channel.send = sinon.stub().resolves(null);
      console.log(msg.channel.send());
      let query = 'waterga';
      let queryString = util.format('[name~/%s/i]', query);
      let result = jsonQuery(queryString, {
        data: enlirAbilities,
        allowRegexp: true,
      });
      return botUtils.sendRichEmbedAbility(result, msg)
        .then( (res) => {
          console.log(res);
          assert.equal(res, null, 'sendRichEmbedAbility succeeded');
        }).catch( (err) => {
          console.log(err);
          assert.fail(err, null, `sendRichEmbedAbility should return null,` +
            ` but we got ${err}`);
        });
    });
  });
});
