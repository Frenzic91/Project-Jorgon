let gameInstance = null;

class Game {
  constructor() {
    if (!gameInstance) {
      // global game state
      this.playerList;
      this.creatureList;
      this.tileMap;
      this.socketList;

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

  getCreatureList() {
    return this.creatureList;
  }

  getTileMap() {
    return this.tileMap;
  }

  getSocketServer() {
    return this.io;
  }

  getSocketList() {
    return this.socketList;
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

  setCreatureList(creatureList) {
    if (!this.creatureList) {
      this.creatureList = creatureList;
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

  setSocketList(socketList) {
    if (!this.socketList) {
      this.socketList = socketList;
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
