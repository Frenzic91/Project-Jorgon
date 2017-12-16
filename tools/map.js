var fs = require('fs');
let mapJSON = JSON.parse(fs.readFileSync('./map/testmap.json','utf8'));
let horizonsTile1x1 = JSON.parse(fs.readFileSync('./map/tiles/horizons.json', 'utf8'));
let horizonsTile3x3 = JSON.parse(fs.readFileSync('./map/tiles/horizons_3_3.json', 'utf8'));

let output = {
  height: mapJSON.height,
  width: mapJSON.width,
  map: []
};

for(let i = 0; i < mapJSON.height; i++){
  output.map[i] = [];
  for(let j = mapJSON.width - 1; j >= 0; j--){
    let tile = {};
    tile.ground = {};
    tile.entity = {};
    tile.ground.id = mapJSON.layers[0].data[i*100+j];
    if(tile.ground.id > 0){
      tile.ground.collission = horizonsTile1x1.tileproperties[tile.ground.id].collision;
    } else {
      tile.ground.collission = false;
    }

    tile.entity.id = mapJSON.layers[1].data[i*100+j];
    if(tile.entity.id > 0){
      tile.entity.collision = horizonsTile3x3.tiles[tile.entity.id].collision
      tile.entity.occlusion = horizonsTile3x3.tiles[tile.entity.id].occlusion
    } else {
      tile.entity.collision = false;
      tile.entity.occlusion = false;
    }
    output.map[i][j] = tile;
  }
}

fs.writeFile('map/output/map.json',JSON.stringify(output),'utf8',console.log("Done."));
