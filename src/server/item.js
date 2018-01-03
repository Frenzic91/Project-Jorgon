var Game = require('./game.js');
var Utils = require('../utils.js');
var CT = require('../constants.js');

var gameInstance = new Game();

class Item {
  constructor() {
  }
}

// the <data> parameter of each function originates on the client
var onUseFunctionTable = {
  18: function(data) { // armor
    console.log('A player tried to use armor (item 18)!');
  },

  17: function(data) { // ultimate healing rune
    // heal the player
    let healAmount = Utils.randNumBetween(30, 70);
    let player = gameInstance.getPlayerList()[data.playerID];

    if (player) {
      let playerHp = player.getHp() + healAmount;

      if (playerHp > 100) {
        playerHp = 100;
      }

      player.setHp(playerHp);
    }

    // destroy the rune
    if (data.itemUsedFromInventory) {
      player.removeInventoryItem(data.inventorySlot);
    } else {
      let itemTile = gameInstance.getTileMap()[CT.MAP_WIDTH * data.targetTileY + data.targetTileX];
      itemTile.popItem();
    }
  }
};

module.exports = {Item, onUseFunctionTable};
