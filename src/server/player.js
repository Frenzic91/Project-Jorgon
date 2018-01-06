var Entity = require('./entity.js');
var CT = require('../constants.js');
var Weapon = require('./weapon.js');
var Utils = require('../utils.js');
var Game = require('./game.js');
var findPath = require('./pathfinder.js');

// Player class (based on Entity) - We should pull this into a seperate file
class Player extends Entity {
  constructor(id, playerData) {
    super();
    this.id = id; // equivalent to socket ID
    this.name = playerData.username;
    this.number = "" + Math.floor(10 * Math.random()); // random array value - likely a better way to do this
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.moveDelay = 300;
    this.moveAmount = 1;
    this.pendingMoveX = 0;
    this.pendingMoveY = 0;
    this.lastMoved = 0;
    this.tileIndex = undefined;
    this.path = undefined;
    this.currentNodeInPath = undefined;
    this.isPathfinding = false;

    this.hp = 200;
    this.hpMax = 200;

    this.target = undefined
    this.lastAttacked = 0;

    this.inventory = {
      "size": 20,
      "items": [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18]
    };

    this.equipment = {"weapon": new Weapon({
      "damage": 45,
      "range": 1,
      "attackDelay": 1000,
      "levelReq": 0
    })};
  }

  getHp() {
    return this.hp;
  }

  getMaxHp() {
    return this.hpMax;
  }

  getInventoryItem(inventorySlot) {
    if (inventorySlot >= 0 && inventorySlot < this.inventory.size) {
      return this.inventory.items[inventorySlot];
    }

    return null;
  }

  removeInventoryItem(inventorySlot) {
    if (inventorySlot >= 0 && inventorySlot < this.inventory.size) {
      this.inventory.items[inventorySlot] = undefined;
    }
  }

  setInventoryItem(inventorySlot, itemID) {
    if (inventorySlot >= 0 && inventorySlot < this.inventory.size && itemID > 0) {
      this.inventory.items[inventorySlot] = itemID;
    }
  }

  setHp(hp) {
    if (0 > hp <= this.hpMax) {
      this.hp = hp;
    }
  }

  setPath(path) {
    this.path = path;
    this.currentNodeInPath = 0;
    this.isPathfinding = true;
  }

  removePath() {
    this.path = undefined;
    this.currentNodeInPath = undefined;
    this.isPathfinding = false;
  }

  movePlayer(pos) {
    this.x = pos.x;
    this.y = pos.y;

    // add packet to player updates
    // ...
  }

  isTargetInRange() {
    if (this.target) {
      return (Math.abs(Math.round(this.x) - Math.round(this.target.x)) <= this.equipment.weapon.range) &&
              (Math.abs(Math.round(this.y) - Math.round(this.target.y)) <= this.equipment.weapon.range)
    }
    return false;
  }

  attack() {
    // only melee attacks for now
    if (this.isTargetInRange() && (Date.now() - this.lastAttacked > this.equipment.weapon.attackDelay)) {
      // set lastAttacked back to curret time
      this.lastAttacked = Date.now();

      if(this.target.takeDamage(Utils.randNumBetween(5, this.equipment.weapon.damage))){
        this.target = undefined;
      }
    }
  }

  takeDamage(amount){
    this.hp -= amount;
    if(this.hp > 0){
      return false;
    } else {
      return true;
    }
  }

  update(tileMap) {
    //this.updateSpd();
    //set the default update function to super_update (for use in new update function)
    if(this.isAlive(tileMap)){
      this.updatePosition(tileMap)
    }
  }

  isAlive(tileMap) {
    if(this.hp > 0){
      return true;
    } else {
      this.resetKeys();
      this.hp = this.hpMax;
      this.x = Math.floor(Math.random()*50);
      this.y = Math.floor(Math.random()*50);
      Player.clearPlayerFromTile(tileMap, this);
      this.target = undefined;
      return false;
    }
  }

  updatePosition(tileMap){
    var xInTiles = this.x;
    var yInTiles = this.y;
    var tileIndexOld = 100 * yInTiles + xInTiles;

    if (!this.isPathfinding) {
      //set the default updatePosition to super_updatePosition (for use in new updatePosition function)
      if(Date.now() - this.lastMoved > this.moveDelay){
        this.updateSpd();

        // use pendingMove if exists
        if(this.pendingMoveX !== 0){
          this.spdX = this.pendingMoveX;
        }
        if(this.pendingMoveY !== 0){
          this.spdY = this.pendingMoveY;
        }
        //Checks collision
        let newX = this.x + this.spdX;
        let newY = this.y + this.spdY;
        let newTileIndex = 100 * newY + newX;

        if(tileMap[newTileIndex]){
          if(!tileMap[newTileIndex].hasCollision()){
            this.lastMoved = Date.now();
            super.updatePosition();
          }
        }

        this.resetPendingMove();
      }

      if(this.x < CT.MINWIDTH){
        this.x = CT.MINWIDTH;
      } else if(this.x > CT.MAXWIDTH){
        this.x = CT.MAXWIDTH;
      }

      if(this.y < CT.MINHEIGHT){
        this.y = CT.MINHEIGHT;
      } else if(this.y > CT.MAXHEIGHT){
        this.y = CT.MAXHEIGHT;
      }
    } else {
      if (Date.now() - this.lastMoved > this.moveDelay) {
        let tileMap = new Game().getTileMap();
        let nextTile = tileMap[CT.MAP_WIDTH * this.path[this.currentNodeInPath].y + this.path[this.currentNodeInPath].x]

        if (this.currentNodeInPath == 0 || !nextTile.hasCollision()) {
          this.movePlayer({
            x: this.path[this.currentNodeInPath].x,
            y: this.path[this.currentNodeInPath].y
          });

          if (this.currentNodeInPath < this.path.length - 1){
            this.currentNodeInPath += 1;
          } else {
            this.removePath();
          }

          this.lastMoved = Date.now();
        } else {
          // recalculate path
          let startCoord = {x: this.x, y: this.y};
          let endCoord = {x: this.path[this.path.length - 1].x, y: this.path[this.path.length - 1].y};

          if (Math.abs(endCoord.x - startCoord.x) <= 1 && Math.abs(endCoord.y - startCoord.y) <= 1) {
            this.removePath();
          } else {
            //let newPath = findPath(startCoord, endCoord);
            //this.setPath(newPath);
            let socket = new Game().getSocketList()[this.id];
            socket.emit('recalculatePath', {startCoord: {x: this.x, y: this.y}, endCoord});
            //socket.emit('recalculatePath', {endCoord});
          }
        }
      }
    }

    var tileIndex = 100 * this.y + this.x;
    // If player moved, make old tile undefined, and update new tile.
    if(tileIndexOld != tileIndex){
      tileMap[tileIndexOld].removeOccupyingPlayer();
      tileMap[tileIndex].setOccupyingPlayer(this);
      this.tileIndex = tileIndex;
      //tileMap[tileIndexOld].occupyingPlayer = undefined;
    } else {
      if (tileMap[tileIndex].getOccupyingPlayer() == undefined) {
        tileMap[tileIndex].setOccupyingPlayer(this);
      }
    }

    //tileMap[tileIndex].setOccupyingPlayer(this);
    //this.tileIndex = tileIndex;
  }

  //Update player speed based on player input (right, left, up, down)
  updateSpd(){
    this.resetSpeed();
    if(this.pressingRight){
      this.spdX = this.moveAmount;
    }
    else if(this.pressingLeft){
      this.spdX = -this.moveAmount;
    }
    else if(this.pressingUp){
      this.spdY = -this.moveAmount;
    }
    else if(this.pressingDown){
      this.spdY = this.moveAmount;
    }
  }

  resetKeys(){
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
  }

  resetSpeed(){
    this.spdX = 0;
    this.spdY = 0;
  }

  resetPendingMove(){
    this.pendingMoveX = 0;
    this.pendingMoveY = 0;
  }

  // Sends the starting data to the client for this player
  getInitPack(){
    return {
      id:this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      number: this.number,
      hp: this.hp,
      hpMax: this.hpMax,
      score: this.score,
      mouseAngle: this.mouseAngle,
      moveDelay: this.moveDelay,
      moveAmount: this.moveAmount,
      inventory: this.inventory
    }
  }

  // Sends the delta data to the client for this player (less data than Init)
  getUpdatePack(){
    return {
      id:this.id,
      x: this.x,
      y: this.y,
      hp: this.hp,
      score: this.score,
      mouseAngle: this.mouseAngle,
      attackTarget: this.target ? this.target.id : undefined
    }
  }

  isMoving(){
    return this.pressingDown || this.pressingLeft || this.pressingRight || this.pressingUp
  }

  // Triggers when a new player socket is created
  static onConnect(playerList, initPack, socket, playerData, tileMap){
    let player = new Player(socket.id, playerData);
    //Initiate Player
    playerList[player.id] = player;

    // Add this player to the server Player array
    initPack.players.push(player.getInitPack());
    console.log(initPack);

    Player.initPlayer(socket, player);
    //Initiate All other players
    Player.init(socket, playerList, tileMap);

    socket.on('keyPress', function(data){
      if(data.inputId === 'left'){
        player.removePath();
        //Queues up the direction button so it triggers player movement -- if player is not moving
        if(!player.isMoving()){
          player.pendingMoveX = -player.moveAmount;
          player.pendingMoveY= 0;
        }
        //If the player was going in a different direction -- Reset movement
        if(player.pressingLeft != data.state && data.state === true){
          player.resetKeys();
        }
        player.pressingLeft = data.state;
      }
      else if(data.inputId === 'right'){
        player.removePath();
        //Queues up the direction button so it triggers player movement -- if player is not moving
        if(!player.isMoving()){
          player.pendingMoveX = player.moveAmount;
          player.pendingMoveY= 0;
        }
        //If the player was going in a different direction -- Reset movement
        if(player.pressingRight != data.state && data.state === true){
          player.resetKeys();
        }
        player.pressingRight = data.state;
      }
      else if(data.inputId === 'up'){
        player.removePath();
        //Queues up the direction button so it triggers player movement -- if player is not moving
        if(!player.isMoving()){
          player.pendingMoveX = 0;
          player.pendingMoveY= -player.moveAmount;
        }
        //If the player was going in a different direction -- Reset movement
        if(player.pressingUp != data.state && data.state === true){
          player.resetKeys();
        }
        player.pressingUp = data.state;
      }
      else if(data.inputId === 'down'){
        player.removePath();
        //Queues up the direction button so it triggers player movement -- if player is not moving
        if(!player.isMoving()){
          player.pendingMoveX = 0;
          player.pendingMoveY= player.moveAmount;
        }
        //If the player was going in a different direction -- Reset movement
        if(player.pressingDown != data.state && data.state === true){
          player.resetKeys();
        }
        player.pressingDown = data.state;
      }
      else if(data.inputId === 'mouseAngle'){
        player.mouseAngle = data.state;
      }
    });
  }

  // Triggers when a player socket disconnects
  static onDisconnect(removePack, playerList, socket, tileMap){
    // Remove player from tile when he disconnects
    Player.clearPlayerFromTile(tileMap, playerList[socket.id]);
    // let tileIndex = playerList[socket.id].tileIndex;
    // if(tileMap[tileIndex]){
    //   if(tileMap[tileIndex].occupyingPlayer == playerList[socket.id]){
    //     tileMap[tileIndex].occupyingPlayer = undefined;
    //   }
    // }
    removePack.players.push(socket.id);
    delete playerList[socket.id];
  }

  static clearPlayerFromTile(tileMap, player){
    let tileIndex = player.tileIndex;
    if(tileMap[tileIndex]){
      if(tileMap[tileIndex].occupyingPlayer == player){
        tileMap[tileIndex].occupyingPlayer = undefined;
      }
    }
  }

  static init(socket, playerList, tileMap){
    let players = Player.getAllInitPack(playerList);

    socket.emit('init', {
      players: players,
      tileData: JSON.stringify(tileMap)
    });
  }

  static getAllInitPack(playerList){
    let players = [];
    for(let i in playerList){
      players.push(playerList[i].getInitPack());
    }
    return players;
  }

  static initPlayer(socket, player){
    socket.emit('initPlayer', player.getInitPack());
  }

  // Updates all players and returns an array
  static getPlayerPositions(playerList, tileMap){
    //console.log("getPlayerPositions()")
    let playerArray = [];
    for(let i in playerList){
      let player = playerList[i];
      player.update(tileMap);
      playerArray.push(player.getUpdatePack());
    }
    return playerArray;
  }

  // handle all player attacks
  static execPlayerAttacks(playerList) {
    for (let i in playerList) {
      let player = playerList[i];
        player.attack()
    }
  }

  // Sends data package to all players
  static sendAllPlayers(SOCKET_LIST, message, data){
    for(let i in SOCKET_LIST){
      let socket = SOCKET_LIST[i];
      socket.emit(message, data);
    }
  }

  // Sends multiple data packages to all players
  static sendAllPlayersMulti(SOCKET_LIST, fullPack){
    for(let i in SOCKET_LIST){
      let socket = SOCKET_LIST[i];
      for(let j in fullPack){
          socket.emit(fullPack[j].message, fullPack[j].data);
      }
    }
  }
}

module.exports = Player;
