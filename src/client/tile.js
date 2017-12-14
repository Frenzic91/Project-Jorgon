class Tile {
  constructor(x, y, spriteId, hasCollision, hasOcclusion) {
    this.x = x;
    this.y = y;
    this.width = CT.width;
    this.height = CT.height;
    this.sprite = spriteId;
    this.hasCollision = hasCollision;
    this.hasOcclusion = hasOcclusion;
    this.itemStack = []
  }
}
