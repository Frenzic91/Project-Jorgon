var Entity = require('./entity.js');
var CT = require('../constants.js');
var Weapon = require('./weapon.js');

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
    this.moveDelay = 150;
    this.moveAmount = 1;
    this.pendingMoveX = 0;
    this.pendingMoveY = 0;
    this.lastMoved = 0;

    this.hp = 100;
    this.hpMax = 100;

    this.target = undefined
    this.lastAttacked = 0;

    this.inventory = [];
    this.equipment = {"weapon": new Weapon({
      "damage": 34,
      "range": 2,
      "attackDelay": 1000,
      "levelReq": 0
    })};
  }

  isTargetInRange() {
    if (this.target) {
      console.log("calculating range, we have a target already")
      // calculate and return the smallest of the horizontal or vertical
      // distance between this player and the target
      console.log(Math.abs(this.x - this.target.x));
      console.log(Math.abs(Math.round(this.y) - Math.round(this.target.y)));

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

      // update target players health, static value for now
      console.log("Hit enemy for %d", this.equipment.weapon.damage);
      this.target.takeDamage(this.equipment.weapon.damage);
      if(!this.target.isAlive()){
        this.target = undefined;
      }
    }
  }

  takeDamage(amount){
    this.hp -= amount;
  }

  update(tileMap) {
    //this.updateSpd();
    //set the default update function to super_update (for use in new update function)
    if(this.isAlive()){
      this.updatePosition(tileMap)
    }
  }

  isAlive() {
    if(this.hp > 0){
      return true;
    } else {
      this.resetKeys();
      this.hp = 100;
      this.x = Math.floor(Math.random()*50);
      this.y = Math.floor(Math.random()*50);
      this.target = undefined;
    }
  }

  updatePosition(tileMap){
    var xInTiles = this.x;
    var yInTiles = this.y;
    var tileIndexOld = 100 * yInTiles + xInTiles;

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

      if(!tileMap[newTileIndex].hasCollision()){
        this.lastMoved = Date.now();
        super.updatePosition();
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

    var tileIndex = 100 * this.y + this.x;
    // If player moved, make old tile undefined, and update new tile.
    if(tileIndexOld != tileIndex){
      tileMap[tileIndexOld].occupyingPlayer = undefined;
    }

      tileMap[tileIndex].occupyingPlayer = this;
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
      moveAmount: this.moveAmount
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
      mouseAngle: this.mouseAngle
    }
  }

  isMoving(){
    return this.pressingDown || this.pressingLeft || this.pressingRight || this.pressingUp
  }

  // Triggers when a new player socket is created
  static onConnect(playerList, initPack, socket, playerData){
    let player = new Player(socket.id, playerData);
    //Initiate Player
    playerList[player.id] = player;

    // Add this player to the server Player array
    initPack.players.push(player.getInitPack());
    console.log(initPack);

    Player.initPlayer(socket, player);
    //Initiate All other players
    Player.init(socket, playerList);

    socket.on('keyPress', function(data){
      if(data.inputId === 'left'){
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
  static onDisconnect(removePack, playerList, socket){
    removePack.players.push(socket.id);
    delete playerList[socket.id];
  }

  static init(socket, playerList){
    let players = Player.getAllInitPack(playerList);

    socket.emit('init', {
      players:players
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
