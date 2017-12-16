class Map {
  constructor(canvas,mapJSON){
    this.data = mapJSON.map;
    this.width = mapJSON.width;
    this.height = mapJSON.height;
    this.canvas = canvas;
    this.offscreenCanvas = document.createElement('canvas');
    this.offsceenContext = this.offscreenCanvas.getContext('2d');
    this.initialized = false;
  }

  initializeMap() {
    this.offscreenCanvas.width = this.width * TILESIZE;
    this.offscreenCanvas.height = this.height * TILESIZE;

    let mapSheet = mapImg.tile.horizons_1_1;

    this.offsceenContext.fillStyle = "#000000";
    this.offsceenContext.fillRect(-WIDTH,-HEIGHT,this.offscreenCanvas.width+WIDTH,this.offscreenCanvas.height+HEIGHT)

    for(let i = 0; i < this.height; i++){
      for(let j = this.width-1; j >= 0; j--){
        let currentTileValue = this.data[i][j].ground.id - SPRITEOFFSET;
        let spriteIndexRow = Math.floor(currentTileValue/(SPRITESHEETWIDTH))
        let spriteIndexCol = currentTileValue % (SPRITESHEETWIDTH);
        // Map is shifted TILESIZE/2 left and TILESIZE/4 up in order to draw players in the middle of tiles
        this.offsceenContext.drawImage(mapSheet, TILESIZE*spriteIndexCol, TILESIZE*spriteIndexRow, TILESIZE, TILESIZE, j*TILESIZE - TILESIZE/2, i*TILESIZE - TILESIZE/4, TILESIZE, TILESIZE);
      }
    }
    this.initialized = true;
  }

  drawGround(x,y){
    let mapSheet = mapImg.tile.horizons_1_1;
    ctxGround.fillStyle = "#000000";
    ctxGround.fillRect(x-2*WIDTH,y-2*HEIGHT,4*WIDTH,4*HEIGHT);
    for(let i = 0; i < this.height; i++){
      for(let j = this.width-1; j >= 0; j--){
        let currentTileValue = this.data[i][j].ground.id - SPRITEOFFSET;
        let spriteIndexRow = Math.floor(currentTileValue/(SPRITESHEETWIDTH))
        let spriteIndexCol = currentTileValue % (SPRITESHEETWIDTH);
        // Map is shifted TILESIZE/2 left and TILESIZE/4 up in order to draw players in the middle of tiles
        this.canvas.drawImage(mapSheet, TILESIZE*spriteIndexCol, TILESIZE*spriteIndexRow, TILESIZE, TILESIZE, j*TILESIZE - TILESIZE/2, i*TILESIZE - TILESIZE/4, TILESIZE, TILESIZE);
      }
    }
  }

  // drawGround(x,y) {
  //   if(this.intialized){
  //     // Take image from off-screen canvas
  //     let image = this.offscreenContext.getImageData(x - WIDTH, y - HEIGHT, WIDTH, HEIGHT);
  //     this.canvas.putImageData(image, x - WIDTH, y - HEIGHT);
  //   } else {
  //     this.initializeMap();
  //   }
  // }


  drawEntities(canvas,x,y){

  }

}
