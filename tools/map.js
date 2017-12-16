var fs = require('fs');
var Tile = require('./tile.js');
let mapJSON = JSON.parse(fs.readFileSync('./map/testmap.json','utf8'));
let horizonsTile1x1 = JSON.parse(fs.readFileSync('./map/tiles/horizons.json', 'utf8'));
let horizonsTile3x3 = JSON.parse(fs.readFileSync('./map/tiles/horizons_3_3.json', 'utf8'));

let output = {
  height: mapJSON.height,
  width: mapJSON.width,
  map: []
};

// This is for entities that have a dimension greater than 1x1 (splits the collision matrix into single tiles)
let setCollision = function(row,col,tileID,map){
  let collisionMatrix = horizonsTile3x3.tiles[tileID].collision
  let dimRow = collisionMatrix.length;
  let dimCol = collisionMatrix[0].length;
  for(let i = 0; i < dimRow; i++){
    for(let j = 0; j < dimCol; j++){
      if(collisionMatrix[i][j] == 1){
        map[row-i][col+j].entity.collision = 1;
      }
    }
  }
}

// This is for entities that have a dimension greater than 1x1 (splits the occlusion matrix into single tiles)
let setOcclusion = function(row,col,tileID,map){
  let occlusionMatrix = horizonsTile3x3.tiles[tileID].occlusion
  let dimRow = occlusionMatrix.length;
  let dimCol = occlusionMatrix[0].length;
  for(let i = 0; i < dimRow; i++){
    for(let j = 0; j < dimCol; j++){
      if(occlusionMatrix[i][j] == 1){
        map[row-i][col+j].entity.occlusion = 1;
      }
    }
  }
}

// Loops through the entire map JSON file, building a two dimension array of tiles
for(let i = 0; i < mapJSON.height; i++){
  output.map[i] = [];
  for(let j = mapJSON.width - 1; j >= 0; j--){
    // Each tile consists of a ground and an entity object.
    let tile = new Tile();
    tile.ground.id = mapJSON.layers[0].data[i*100+j];
    if(tile.ground.id > 0){
      tile.ground.collission = horizonsTile1x1.tileproperties[tile.ground.id].collision;
    } else {
      tile.ground.collission = 0;
    }

    tile.entity.id = mapJSON.layers[1].data[i*100+j];
    if(tile.entity.id > 0){
      setCollision(i,j,tile.entity.id,output.map);
      setOcclusion(i,j,tile.entity.id,output.map);
      tile.entity.collision = horizonsTile3x3.tiles[tile.entity.id].collision[0][0];
      tile.entity.occlusion = horizonsTile3x3.tiles[tile.entity.id].occlusion[0][0];
    } else {
      tile.entity.collision = 0;
      tile.entity.occlusion = 0;
    }
    output.map[i][j] = tile;
  }
}

fs.writeFile('map/output/map.json',JSON.stringify(output),'utf8',console.log("Map Generation Completed."));
