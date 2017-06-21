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
  let msg = sinon.createStubInstance(discord.Client);
  msg.author = sinon.createStubInstance(discord.User);
  msg.channel = sinon.createStubInstance(discord.TextChannel);
  msg.channel.send = sinon.stub().resolves(null);
  msg.author.username = null;
  msg.author.discriminator = null;
  describe('lookupAbility', () => {
    let args = 'waterga';
    it('Should call sendRichEmbedAbility', () => {
      let stub = sinon.stub(botUtils, 'sendRichEmbedAbility');
      stub.resolves(null);
      res = botUtils.ability(msg, args);
      stub.restore();
      assert.equal(res, null, 'ability called sendRichEmbedAbility');
    });
    it('Should fall back to processAbility when sendRichEmbedAbility fails',
        () => {
          let stub = sinon.stub(botUtils, 'sendRichEmbedAbility');
          stub.rejects(null);
          res = botUtils.ability(msg, args);
          stub.restore();
          assert.equal(res, null, 'ability called processAbility');
        });
  });
  describe('sendRichEmbedAbility', () => {
    it('Should construct and send a RichEmbedAbility', () => {
      let msg = sinon.createStubInstance(discord.Client);
      msg.channel = sinon.createStubInstance(discord.TextChannel);
      msg.channel.send = sinon.stub().resolves(null);
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
