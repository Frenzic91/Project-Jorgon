var CT = require('../constants.js');

class Tile {
  constructor(x, y, collision) {
    this.x = x;
    this.y = y;
    this.occupyingPlayer = undefined;
    this.collision = collision;
    this.itemStack = [];
  }

  hasCollision() {
    if(this.occupyingPlayer || this.collision){
      return true;
    } else {
      return false;
    }
  }

}

module.exports = Tile;
