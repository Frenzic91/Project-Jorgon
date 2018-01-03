let gameInstance = null;

class Game {
  constructor() {
    if (!gameInstance) {
      // global game state
      this.playerList;
      this.tileMap;

      // socket server reference
      this.io;

      // sent in update pack each server frame
      this.playerUpdates = [];
      this.creatureUpdates = [];
      this.tileUpdates = [];

      gameInstance = this;
    }

    return gameInstance;
  }

  // getters

  getPlayerList() {
    return this.playerList;
  }

  getTileMap() {
    return this.tileMap;
  }

  getSocketServer() {
    return this.io;
  }

  getPlayerUpdates() {
    return this.playerUpdates;
  }

  getCreatureUpdates() {
    return this.creatureUpdates;
  }

  getTileUpdates() {
    return this.tileUpdates;
  }

  // setters

  setPlayerList(playerList) {
    if (!this.playerList) {
      this.playerList = playerList;
    }
  }

  setTileMap(tileMap)  {
    if (!this.tileMap) {
      this.tileMap = tileMap;
    }
  }

  setSocketServer(io) {
    if (!this.io) {
      this.io = io;
    }
  }

  pushPlayerUpdate(updatePacket) {
    this.playerUpdates.push(updatePacket);
  }

  pushCreatureUpdate(updatePacket) {
    this.creatureUpdates.push(updatePacket);
  }

  pushTileUpdate(updatePacket) {
    this.tileUpdates.push(updatePacket);
  }

  clearUpdatePacks()  {
    this.playerUpdates = [];
    this.creatureUpdates = [];
    this.tileUpdates = [];
  }
}

module.exports = Game;
