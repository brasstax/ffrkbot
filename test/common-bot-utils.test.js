const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const path = require('path');

const botPath = path.join(__dirname, '..', 'utilities',
  'common-bot-utils.js');
const botUtils = require(botPath);

describe('common bot utilities', () => {
  describe('returnDescription testing', () => {
    let ability;
    beforeEach( () => {
      ability = {};
    });
    it('should return defined ability effects', () => {
      ability.effects = 'Casts haste';
      assert.equal(botUtils.returnDescription(ability), 'Casts haste');
    });
    it('should return formula + "attack" for non-string effects', () => {
      ability.formula = 'Magical';
      assert.equal(botUtils.returnDescription(ability), 'Magical Attack');
    });
    it('should return formula + "attack" for undefined effects', () => {
      ability.formula = 'Magical';
      assert.equal(botUtils.returnDescription(ability), 'Magical Attack');
    });
  });
  describe('returnMultiplier testing', () => {
    let ability;
    beforeEach( () => {
      ability = {};
    });
    it('should return a numerical multiplier for' +
        ' an ability with a defined numerical multiplier', () => {
      ability.multiplier = 10;
      assert.equal(botUtils.returnMultiplier(ability), 10);
    });
    it('should return 0 for an undefined ability multiplier', () => {
      assert.equal(botUtils.returnMultiplier(ability), 0);
    });
    it('should return 0 for a null multiplier', () => {
      ability.multiplier = null;
      assert.equal(botUtils.returnMultiplier(ability), 0);
    });
    it('should return 0 for a non-numerical multiplier', () => {
      ability.multiplier = 'test';
      assert.equal(botUtils.returnMultiplier(ability), 0);
    });
  });
  describe('returnElement testing', () => {
    let ability;
    beforeEach( () => {
      ability = {};
    });
    it('should return an ability with a defined element', () => {
      ability.element = 'Lightning';
      assert.equal(botUtils.returnElement(ability), 'Lightning');
    });
    it('should return None for an ability with an element that' +
        ' starts with a punctuation mark', () => {
      ability.element = '!Holy';
      assert.equal(botUtils.returnElement(ability), 'None');
    });
    it('should return None for an ability with no element', () => {
      assert.equal(botUtils.returnElement(ability), 'None');
    });
  });
  describe('returnPropertyString testing', () => {
    it('should return a padded spell-type string', () => {
      let property = 'WHT';
      let description = 'Type';
      let padLength = 8;
      results = botUtils.returnPropertyString(
        property, description, padLength);
      assert.equal(results, 'Type: WHT');
    });
    it('should return a non-padded element string', () => {
      let property = 'Holy';
      let description = 'Element';
      assert.equal(botUtils.returnPropertyString(
        property, description), 'Element: Holy');
    });
  });
  describe('returnDefaultDuration testing', () => {
    let statusEffect;
    beforeEach( () => {
      statusEffect = {};
    });
    it('should return the duration if it\'s a number', () => {
      statusEffect.defaultDuration = 25;
      assert.equal(botUtils.returnDefaultDuration(statusEffect), 25);
    });
    it('should return the duration if it\'s a number as a string', () => {
      statusEffect.defaultDuration = '25';
      assert.equal(botUtils.returnDefaultDuration(statusEffect), 25);
    });
    it('should return 0 if the duration is not a number', () => {
      assert.equal(botUtils.returnDefaultDuration(statusEffect), 0);
    });
  });
  describe('returnNotes testing', () => {
    let statusEffect;
    beforeEach( () => {
      statusEffect = {};
    });
    it('should return the notes of the status effect if defined', () => {
      statusEffect.notes = 'Not used';
      assert.equal(botUtils.returnNotes(statusEffect), 'Not used');
    });
    it('should return N/A for notes that are only a -', () => {
      statusEffect.notes = '-';
      assert.equal(botUtils.returnNotes(statusEffect), 'N/A');
    });
  });
  describe('returnImageLink testing', () => {
    const ability = {
      name: 'Fire',
    };
    let baseUri = 'https://dff.sp.mbga.jp/dff/static/lang/image';
    let abilityUri = baseUri + '/ability/30111001/30111001_128.png';
    let sbUri = baseUri + '/soulstrike/30111001/30111001_256.png';
    let defaultImage = 'https://cdn.discordapp.com/embed/avatars/0.png';
    beforeEach( () => {
      ability.id = '30111001';
    });
    it('should return a default image for an undefined ability id', () => {
      ability.id = undefined;
      assert.equal(botUtils.returnImageLink(ability), defaultImage);
    });
    it('should return a 128px URI for non-soulbreak abilities', () => {
      let abilityType = 'ability';
      assert.equal(botUtils.returnImageLink(ability, abilityType),
        abilityUri);
    });
    it('should return a 256px URI for soulbreak abilities', () => {
      let abilityType = 'soulstrike';
      assert.equal(botUtils.returnImageLink(ability, abilityType),
        sbUri);
    });
  });
});
