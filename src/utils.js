let Game = require('./server/game.js');
let CT = require('./constants.js');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function randNumBetween(a, b) {
  return Math.floor((Math.random() * (b - a)) + a);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function isValidCoord(coord) {
  let tileMap = new Game().getTileMap();
  return !tileMap[100 * coord.y + coord.x].hasCollision();
}

function isValidMapPosition(pos) {
  return pos.x >= 0 && pos.x <= CT.MAP_WIDTH && pos.y >= 0 && pos.y <= CT.MAP_HEIGHT;
}

function isSamePos(p1, p2) {
  return p1.x == p2.x && p1.y == p2.y;
}

module.exports = {isNumeric, randNumBetween, getRandomInt, isValidCoord, isValidMapPosition, isSamePos}
