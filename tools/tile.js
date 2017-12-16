class Tile {
  constructor(){
    this.ground = {
      id: 0,
      collision: 0
    };
    this.entity = {
      id: 0,
      collision: 0,
      occlusion: 0
    };
  }
}

module.exports = Tile;
