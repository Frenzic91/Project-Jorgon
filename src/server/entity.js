var Utils = require('../utils.js');
var CT = require('../constants.js');

class Entity {
  constructor(SpawnX = CT.DEFAULTSPAWNX, SpawnY = CT.DEFAULTSPAWNY) {
    this.x = SpawnX;
    this.y = SpawnY;
    this.spdX = 0;
    this.spdY = 0;
    this.id = "";
  }

  updatePosition() {
    this.x += this.spdX;
    this.y += this.spdY;
  }

  update() {
    this.updatePosition();
  }

  getDistance(point) {
    return Math.sqrt(Math.pow(this.x-point.x,2) + Math.pow(this.y-point.y,2));
  }
}

module.exports = Entity;
