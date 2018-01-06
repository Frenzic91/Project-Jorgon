var CT = require('../constants.js');
var Game = require('./game.js');
var gameInstance = new Game();

class Tile {
  constructor(x, y, collision, itemStack) {
    this.x = x;
    this.y = y;
    this.occupyingPlayer = undefined;
    this.collision = collision;
    this.itemStack = itemStack;
  }

  getTopItem() {
    let itemStackSize = this.itemStack.length;

    return (itemStackSize > 0 ? this.itemStack[itemStackSize - 1] : null);
  }

  getOccupyingPlayer() {
    return this.occupyingPlayer;
  }

  setOccupyingPlayer(player) {
    this.occupyingPlayer = player;

    gameInstance.pushTileUpdate({
      x: this.x,
      y: this.y,
      playerID: this.occupyingPlayer.id,
      setOccupyingPlayer: true
    });
  }

  removeOccupyingPlayer() {
    this.occupyingPlayer = undefined;

    gameInstance.pushTileUpdate({
      x: this.x,
      y: this.y,
      removeOccupyingPlayer: true
    });
  }

  popItem() {
    if (this.itemStack.length > 0) {
      gameInstance.pushTileUpdate({
        x: this.x,
        y: this.y,
        popItem: true
      });

      return this.itemStack.pop();
    }
  }

  pushItem(itemID) {
    if (itemID > 0) {
      gameInstance.pushTileUpdate({
        x: this.x,
        y: this.y,
        itemID: itemID,
        pushItem: true
      });

      this.itemStack.push(itemID);
    }
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
