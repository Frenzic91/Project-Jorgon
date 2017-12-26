var CT = require('../constants.js');

class Tile {
  constructor(x, y, ground, entity) {
    this.x = x;
    this.y = y;
    this.occupyingPlayer = undefined;
    this.ground = {
      spriteId: ground.spriteId,
      hasCollision: ground.collision
    }
    this.entity = {
      spriteId: entity.spriteId,
      hasCollision: entity.collision,
      hasOcclusion: entity.occlusion
    }
    this.itemStack = []
  }
}

module.exports = Tile;
