class Tile {
  constructor(x, y, occupyingPlayer, collision, itemStack) {
    this.x = x;
    this.y = y;
    this.occupyingPlayer = occupyingPlayer;
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
  }

  removeOccupyingPlayer() {
    this.occupyingPlayer = undefined;
  }

  popItem() {
    if (this.itemStack.length > 0) {
      return this.itemStack.pop();
    }
  }

  pushItem(item) {
    if (item) {
      this.itemStack.push(item);
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
