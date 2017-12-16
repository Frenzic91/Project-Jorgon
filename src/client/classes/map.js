class Map {
  constructor(canvas,mapJSON){
    this.data = mapJSON.map;
    this.width = mapJSON.width;
    this.height = mapJSON.height;
    this.canvas = canvas;
  }

  drawGround(x,y){
    let mapSheet = mapImg.tile.horizons_1_1;
    ctxGround.fillRect(-WIDTH,-HEIGHT,this.width+WIDTH,this.height+HEIGHT);
    for(let i = 0; i < this.height; i++){
      for(let j = this.width-1; j >= 0; j--){
        let currentTileValue = this.data[i][j].ground.id - SPRITEOFFSET + 1; // Not sure why this 1 offset is required, will check this garbage map editor
        let spriteIndexRow = Math.floor(currentTileValue/(SPRITESHEETWIDTH - 1))
        let spriteIndexCol = currentTileValue % (SPRITESHEETWIDTH - 1);
        this.canvas.drawImage(mapSheet, TILESIZE*spriteIndexCol, TILESIZE*spriteIndexRow, TILESIZE, TILESIZE, i*TILESIZE, j*TILESIZE, TILESIZE, TILESIZE);
      }
    }
  }

  drawEntities(canvas,x,y){

  }



}
