class Map {
  constructor(canvas,mapJSON){
    this.data = mapJSON.map;
    this.width = mapJSON.width;
    this.height = mapJSON.height;
    this.canvas = canvas;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenContext = this.offscreenCanvas.getContext('2d');
    this.initialized = false;
  }

  initializeMap() {
    this.offscreenCanvas.width = this.width * TILESIZE;
    this.offscreenCanvas.height = this.height * TILESIZE;

    let mapSheet = mapImg.tile.horizons_1_1;
    let mapSheetTileSize = mapSheet.width / 5;

    this.offscreenContext.fillStyle = "#000000";
    this.offscreenContext.fillRect(-WIDTH/2,-HEIGHT/2,this.width*TILESIZE+WIDTH,this.height*TILESIZE+HEIGHT)

    for(let i = 0; i < this.height; i++){
      for(let j = this.width-1; j >= 0; j--){
        let currentTileValue = this.data[i][j].ground.id - GROUNDOFFSET;
        if(currentTileValue >= 0){
          // Calculate the row/column to grab the image from the sprite map
          let spriteIndexRow = Math.floor(currentTileValue/(SPRITESHEETWIDTH))
          let spriteIndexCol = currentTileValue % (SPRITESHEETWIDTH);
          // Map is shifted TILESIZE/2 left and TILESIZE/4 up in order to draw players in the middle of tiles
          this.offscreenContext.drawImage(mapSheet, mapSheetTileSize*spriteIndexCol, mapSheetTileSize*spriteIndexRow, mapSheetTileSize, mapSheetTileSize, j*TILESIZE - TILESIZE/2, i*TILESIZE - TILESIZE/4, mapSheetTileSize, mapSheetTileSize);
        }
      }
    }
    this.initialized = true;
  }

  drawGround() {
    if(this.initialized){
      try {
      this.canvas.fillStyle = "#000000";
      this.canvas.fillRect(-WIDTH/2,-HEIGHT/2,this.width*TILESIZE+WIDTH,this.height*TILESIZE+HEIGHT)
      this.canvas.drawImage(this.offscreenCanvas, 0, 0);
    } catch(err) {
        console.log("reinitializing MAP");
        this.initializeMap();
      }
    } else {
      this.initializeMap();
    }
  }

  hasOcclusion(x,y){
    return (this.data[y][x].entity.occlusion == 1) ? true : false;
  }

}
