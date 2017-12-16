var Entity = require('./entity.js');
var CT = require('../constants.js');

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
    this.moveAmount = 64;
    this.pendingMoveX = 0;
    this.pendingMoveY = 0;
    this.lastMoved = 0;

    this.hp = 100;
    this.hpMax = 100;
  }


  update() {
    //this.updateSpd();
    //set the default update function to super_update (for use in new update function)
    this.updatePosition()
  }

  updatePosition(){
    //set the default updatePosition to super_updatePosition (for use in new updatePosition function)
    if(Date.now() - this.lastMoved > this.moveDelay){
      this.updateSpd();
      this.lastMoved = Date.now();
      // use pendingMove if exists
      if(this.pendingMoveX !== 0){
        this.spdX = this.pendingMoveX;
      }
      if(this.pendingMoveY !== 0){
        this.spdY = this.pendingMoveY;
      }
      super.updatePosition();
      this.resetPendingMove();
    }
    if(this.x < CT.MINWIDTH){
      this.x += this.moveAmount;
    } else if(this.x > CT.MAXWIDTH){
      this.x -= this.moveAmount;
    }

    if(this.y < CT.MINHEIGHT){
      this.y += this.moveAmount;
    } else if(this.y > CT.MAXHEIGHT){
      this.y -= this.moveAmount;
    }
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

    Player.initPlayer(socket, player);
    //Initiate All other players
    Player.init(socket);

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

  static init(socket){
    let players = Player.getAllInitPack();

    socket.emit('init', {
      players:players
    });
  }

  static getAllInitPack(){
    let players = [];
    for(let i in Player.list){
      players.push(Player.list[i].getInitPack());
    }
    return players;
  }

  static initPlayer(socket, player){
    socket.emit('initPlayer', player.getInitPack());
  }

  // Updates all players and returns an array
  static getPlayerPositions(playerList){
    //console.log("getPlayerPositions()")
    let playerArray = [];
    for(let i in playerList){
      let player = playerList[i];
      player.update();
      playerArray.push(player.getUpdatePack());
    }
    return playerArray;
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
