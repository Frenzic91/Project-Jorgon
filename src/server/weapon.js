var Item = require('./item.js').Item;
var itemData = require('./itemData.js');

class Weapon extends Item {
  constructor(itemID) {
    super(itemID);
    this.atk = itemData[itemID].atk;
    this.def = itemData[itemID].def;
    this.range = itemData[itemID].range;
    this.attackDelay = itemData[itemID].attackDelay;
    this.levelReq = itemData[itemID].levelReq;
  }
}

module.exports = Weapon;
