let Game = require('./server/game.js');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function randNumBetween(a, b) {
  return Math.floor((Math.random() * (b - a)) + a);
}

function isValidCoord(coord) {
  let tileMap = new Game().getTileMap();
  return !tileMap[100 * coord.y + coord.x].hasCollision();
}



module.exports = {isNumeric, randNumBetween, isValidCoord}
