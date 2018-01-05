let Game = require('./server/game.js');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function randNumBetween(a, b) {
  return Math.floor((Math.random() * (b - a)) + a);
}

function isValidCoord(coord) {
  let tileMap = new Game().getTileMap();
  let tile = tileMap[100 * coord.y + coord.x];
  console.log(tile);

  return tile ? true : false;
}

function isSameCoord(coord1, coord2) {
  return coord1.x == coord2.x && coord1.y == coord2.y;
}

module.exports = {isNumeric, randNumBetween, isValidCoord, isSameCoord}
