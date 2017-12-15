var utils = require('../utils.js');
var CT = require('../constants.js');

class Entity {
  constructor(SpawnX = CT.WIDTH/2, SpawnY = CT.HEIGHT/2) {
    this.x = utils.isNumeric(SpawnX);
    this.y = utils.isNumeric(SpawnY);
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
