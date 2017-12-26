var Item = require('./item.js');

class Weapon extends Item {
  constructor(properties) {
    super();
    this.damage = properties.damage;
    this.range = properties.range;
    this.attackDelay = properties.attackDelay;
    this.levelReq = properties.levelReq;
  }
}

module.exports = Weapon;
