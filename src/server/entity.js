var utils = require('../utils.js');
var CT = require('../constants.js');

class Entity {
  constructor(SpawnX, SpawnY) {
    this.x = utils.isNumeric(SpawnX) ? SpawnX : CT.WIDTH/2;
    this.y = utils.isNumeric(SpawnY) ? SpawnY : CT.HEIGHT/2;
    this.spdX = 0;
    this.spdY = 0;
    this.id = "";
  }

  updatePosition() {

  }

  update() {
    this.x += this.spdX;
    this.y += this.spdY;
    //this.updatePosition();
  }

  getDistance(point) {
    return Math.sqrt(Math.pow(this.x-point.x,2) + Math.pow(this.y-point.y,2));
  }
}

module.exports = Entity;
