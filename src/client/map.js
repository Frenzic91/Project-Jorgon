var fs = require('fs');
let map = JSON.parse(fs.readFileSync('./map.json','utf8'));

var MapTile = function(x, y, width, height, sprite){
  let self = {};
  self.x = x;
  self.y = y;
  self.width = width;
  self.height = height;
  self.sprite = sprite;
  return self;
}
