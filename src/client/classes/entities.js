class Entities {

  constructor(canvas,mapJSON){
    this.data = mapJSON.map;
    this.width = mapJSON.width;
    this.height = mapJSON.height;
    this.canvas = canvas;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenContext = this.offscreenCanvas.getContext('2d');
    this.offscreenCanvasAll = document.createElement('canvas');
    this.offscreenContextAll = this.offscreenCanvasAll.getContext('2d');
  }

  // New entity drawing method - Draws all entities onto a virtual canvas - this canvas is then drawn based on the players location onscreen
  initializeAllEntities(){
    let entitySheet = mapImg.entities.horizons_4_4;
    let entitySheetTileSize = entitySheet.width; // Divide this by number of entities per row

    let spriteWidthTiles = entitySheetTileSize/TILESIZE;

    this.offscreenCanvasAll.width = this.width * TILESIZE;
    this.offscreenCanvasAll.height = this.height * TILESIZE;

    for(let y = 0; y < this.height; y++){
      for(let x = this.width - 1; x >= 0; x--){
        let currentTileValue = this.data[y][x].entity.id - ENTITYOFFSET;
        if(currentTileValue >= 0){
          // Calculate the row/column to grab the image from the sprite map
          let spriteIndexRow = Math.floor(currentTileValue/(SPRITESHEETWIDTH))
          let spriteIndexCol = currentTileValue % (SPRITESHEETWIDTH);
          this.offscreenContextAll.drawImage(entitySheet, entitySheetTileSize*spriteIndexCol, entitySheetTileSize*spriteIndexRow, entitySheetTileSize, entitySheetTileSize, x*TILESIZE, (y-(spriteWidthTiles-1))*TILESIZE, entitySheetTileSize, entitySheetTileSize);
        }
      }
    }
  }

  // New entity drawing method, uses the full rendered entity image to draw based on the player's location
  drawEntities(playerX, playerY){
    let offScreenDrawDistance = 4*TILESIZE;
    let topLeftX = playerX*TILESIZE - WIDTH/2 - offScreenDrawDistance/2;
    let topLeftY = playerY*TILESIZE - HEIGHT/2 - offScreenDrawDistance/2;
    //this.canvas.drawImage(this.offscreenCanvas, 0, 0);
    //this.canvas.drawImage(this.offscreenCanvas, topLeftX - TILESIZE/2, topLeftY - TILESIZE/4);
    //console.log(topLeftX, topLeftY);
    this.canvas.drawImage(this.offscreenCanvasAll, topLeftX, topLeftY, WIDTH + offScreenDrawDistance, HEIGHT + offScreenDrawDistance, topLeftX - TILESIZE/2, topLeftY - TILESIZE/4, WIDTH + offScreenDrawDistance, HEIGHT + offScreenDrawDistance);

  }

  drawItems(playerX, playerY){
    let startX = playerX - Math.ceil((WIDTH/TILESIZE)/2);
    let startY = playerY - Math.ceil((HEIGHT/TILESIZE)/2);
    let EndX = startX + WIDTH/TILESIZE;
    let EndY = startY + HEIGHT/TILESIZE;

    for(let i = getIndexFromCoords(startX,startY); i <= getIndexFromCoords(EndX,EndY); i++){
      if(tileData[i].itemStack.length > 0){
        this.canvas.drawImage(itemImg.item.temp, tileData[i].x * TILESIZE - TILESIZE/2, tileData[i].y * TILESIZE - TILESIZE/4);
      }
    }
  }

}
