var Utils = require('../utils.js');
var CT = require('../constants.js');
let Game = require('./game.js');
let gameInstance = new Game();

class Entity {
  constructor(SpawnX = CT.DEFAULTSPAWNX, SpawnY = CT.DEFAULTSPAWNY, atk, def) {
    this.x = SpawnX;
    this.y = SpawnY;
    this.atk = atk || 0;
    this.def = def || 0;
    this.spdX = 0;
    this.spdY = 0;
    this.id = "";
  }

  moveTo(pos) {
    if (Utils.isValidMapPosition(pos)) {
      this.x = pos.x;
      this.y = pos.y
    }
  }

  updatePosition() {
    this.x += this.spdX;
    this.y += this.spdY;
  }

  update() {
    this.updatePosition();
  }

  // euclidean
  getDistance(point) {
    return Math.sqrt(Math.pow(this.x-point.x,2) + Math.pow(this.y-point.y,2));
  }

  getManhattanDistanceTo(pos) {
    return (Math.abs(this.x - pos.x), Math.abs(this.y - pos.y));
  }
}

module.exports = Entity;
