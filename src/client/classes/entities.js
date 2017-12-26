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

  //This needs to be updated - i.e draw all static entities to a virtual canvas like the map, but only redraw the ones that have occlusion)
  // initializeEntitiesOld(playerCordX, playerCordY){
  //   let entitySheet = mapImg.entities.horizons_4_4;
  //   let entitySheetTileSize = entitySheet.width; // This will need to be updated -> entitySheet.width / 5
  //
  //   let spriteWidthTiles = Math.floor(entitySheetTileSize/TILESIZE);
  //   let tileStartX = playerCordX - Math.ceil((WIDTH/64)/2) - spriteWidthTiles; //need to replace 3 with sprite width (this should be another value on the tile)
  //   let tileStartY = playerCordY - Math.ceil((HEIGHT/64)/2) - spriteWidthTiles; //need to replace 3 with sprite width (this should be another value on the tile)
  //
  //   let tilesX = Math.ceil(WIDTH/64) + spriteWidthTiles*2; // how many tiles to draw on x axis
  //   let tilesY = Math.ceil(HEIGHT/64) + spriteWidthTiles*2; // how many tiles to draw on y axis
  //
  //   this.offscreenCanvas.width = tilesX * TILESIZE;
  //   this.offscreenCanvas.height = tilesY * TILESIZE;
  //
  //   let virtualY = 0;
  //   let totalTrees = 0;
  //
  //   // Traverse the map going LEFT-DOWN
  //   for(let i = tileStartY; i <= tileStartY + tilesY; i++){
  //     // If index is in array bounds
  //     let virtualX = tilesX;
  //     if(i >= 0){
  //       for(let j = tileStartX + tilesX; j >= tileStartX; j--){
  //         // If index is in array bounds
  //         if(j >= 0){
  //           //console.log(tileStartX, tileStartY, tileEndX, tileEndY, j, i);
  //           let currentTileValue = this.data[i][j].entity.id - ENTITYOFFSET;
  //           if(currentTileValue >= 0){
  //             //console.log("drawing Tree @", j, i);
  //             // Calculate the row/column to grab the image from the sprite map
  //             let spriteIndexRow = Math.floor(currentTileValue/(SPRITESHEETWIDTH))
  //             let spriteIndexCol = currentTileValue % (SPRITESHEETWIDTH);
  //             this.offscreenContext.drawImage(entitySheet, entitySheetTileSize*spriteIndexCol, entitySheetTileSize*spriteIndexRow, entitySheetTileSize, entitySheetTileSize, virtualX*TILESIZE, (virtualY-(spriteWidthTiles-1))*TILESIZE, entitySheetTileSize, entitySheetTileSize);
  //           }
  //         }
  //         virtualX--;
  //       }
  //     }
  //     virtualY++;
  //   }
  //
  //   //console.log("Total Trees: ", totalTrees);
  // }

  // drawEntitiesOld(playerX, playerY){
  //   this.initializeEntities(playerX, playerY);
  //   let topLeftX = playerX*TILESIZE - WIDTH/2;
  //   let topLeftY = playerY*TILESIZE - HEIGHT/2;
  //   //this.canvas.drawImage(this.offscreenCanvas, 0, 0);
  //   //this.canvas.drawImage(this.offscreenCanvas, topLeftX - TILESIZE/2, topLeftY - TILESIZE/4);
  //   this.canvas.drawImage(this.offscreenCanvas, topLeftX - 4*TILESIZE - TILESIZE/2, topLeftY - 4*TILESIZE - TILESIZE/2);d
  // }

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

}
