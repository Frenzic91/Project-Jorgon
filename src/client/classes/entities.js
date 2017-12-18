class Entities {

  constructor(canvas,mapJSON){
    this.data = mapJSON.map;
    this.width = mapJSON.width;
    this.height = mapJSON.height;
    this.canvas = canvas;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenContext = this.offscreenCanvas.getContext('2d');
  }


  //This needs to be updated - i.e draw all static entities to a virtual canvas like the map, but only redraw the ones that have occlusion)
  initializeEntities(playerX, playerY){
    let entitySheet = mapImg.entities.horizons_3_3;
    let entitySheetTileSize = entitySheet.width; // This will need to be updated -> entitySheet.width / 5

    let playerCordX = playerX / 64;
    let playerCordY = playerY / 64;

    let tileStartX = playerCordX - 10 - 3;
    let tileStartY = playerCordY - 6 - 3;

    let tilesX = 30;
    let tilesY = 17;

    // let topLeftX = playerX - WIDTH/2;
    // topLeftX = topLeftX - (topLeftX % 64);
    // let topLeftY = playerY - HEIGHT/2;
    // topLeftY = topLeftY - (topLeftY % 64);
    // let tileStartX = topLeftX / TILESIZE - 1;
    // let tileStartY = Math.floor(topLeftY / TILESIZE) - 1;
    // let tileEndX = tileStartX + (WIDTH/TILESIZE);
    // let tileEndY = Math.floor(tileStartY + (HEIGHT/TILESIZE));

    // this.offscreenCanvas.width = WIDTH;
    // this.offscreenCanvas.height = HEIGHT;

    this.offscreenCanvas.width = tilesX * TILESIZE;
    this.offscreenCanvas.height = tilesY * TILESIZE;




    let virtualY = 0;

    let totalTrees = 0;

    // Traverse the map going LEFT-DOWN
    for(let i = tileStartY; i <= tileStartY + tilesY; i++){
      // If index is in array bounds
      let virtualX = tilesX;
      if(i >= 0){
        for(let j = tileStartX + tilesX; j >= tileStartX; j--){
          // If index is in array bounds
          if(j >= 0){
            //console.log(tileStartX, tileStartY, tileEndX, tileEndY, j, i);
            let currentTileValue = this.data[i][j].entity.id - ENTITYOFFSET;
            if(currentTileValue >= 0){
              //console.log("drawing Tree @", j, i);
              // Calculate the row/column to grab the image from the sprite map
              let spriteIndexRow = Math.floor(currentTileValue/(SPRITESHEETWIDTH))
              let spriteIndexCol = currentTileValue % (SPRITESHEETWIDTH);
              this.offscreenContext.drawImage(entitySheet, entitySheetTileSize*spriteIndexCol, entitySheetTileSize*spriteIndexRow, entitySheetTileSize, entitySheetTileSize, virtualX*TILESIZE, (virtualY-2)*TILESIZE, entitySheetTileSize, entitySheetTileSize);
            }
          }
          virtualX--;
        }
      }
      virtualY++;
    }

    //console.log("Total Trees: ", totalTrees);

  }

  drawEntities(playerX, playerY){
    this.initializeEntities(playerX, playerY);
    let topLeftX = playerX - WIDTH/2;
    topLeftX = topLeftX - (topLeftX % 64);
    let topLeftY = playerY - HEIGHT/2;
    topLeftY = topLeftY - (topLeftY % 64);
    //this.canvas.drawImage(this.offscreenCanvas, 0, 0);
    //this.canvas.drawImage(this.offscreenCanvas, topLeftX - TILESIZE/2, topLeftY - TILESIZE/4);
    this.canvas.drawImage(this.offscreenCanvas, topLeftX - 3*TILESIZE - TILESIZE/2, topLeftY - 3*TILESIZE - TILESIZE/4);

  }

}
