var mongojs = require('mongojs');
var db = mongojs('localhost:27017/Jorgon', ['account', 'progress']);
var colors = require('colors/safe');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {});

const DEBUG = true;

var SOCKET_LIST = {};

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/test', function(req,res){
  res.sendFile(__dirname + '/client/test.html');
})

app.use('/client', express.static(__dirname + '/client'));

var isValidPassword = function(data, cb){
  db.account.find({usernameKey:data.username.toUpperCase(), password:data.password}, function(err, res){
    if(res.length > 0){
      cb(true, res);
    } else {
      cb(false);
    }
  });
}

var isUsernameTaken = function(data, cb){
  db.account.find({usernameKey:data.username.toUpperCase()},function(err,res){
    if(res.length > 0){
      cb(true);
    } else {
      cb(false);
    }
  });
}

var addUser = function(data, cb){
  db.account.insert({usernameKey:data.username.toUpperCase(), username:data.username, password:data.password},function(err){
    if(!err){
      cb(true);
    } else {
      cb(false);
    }
  });
}

io.sockets.on('connection', function(socket){
  console.log('socket connection.');
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on('login', function(data){
    isValidPassword(data, function(status, res){
      if(status){
        Player.onConnect(socket, res[0]);
        socket.emit('loginResponse', {success:true});
      } else {
        socket.emit('loginResponse', {success:false});
      }
    });
  });

  socket.on('register', function(data){
    isUsernameTaken(data, function(res){
      if(res){
        socket.emit('registerResponse', {success:false});
      } else {
        addUser(data,function(res){
          if(res){
            socket.emit('registerResponse', {success:true});
          } else {
            socket.emit('registerResponse', {success:false});
          }
        });
      }
    });
  });

  socket.on('sendMsgToServer', function(data){
    var playerName = Player.list[socket.id].name;
    Player.sendAllPlayers('addToChat', playerName + ': ' + data);
    console.log('sent ' + data + ' to all players');
  });

  socket.on('evalServer', function(data){
    if(!DEBUG){
      return;
    }
    var response = "";
    try {
      response = eval(data);
    } catch (e) {
      response = e.message;
    }
    console.log(data + ' Evaluates to: ' + response);
    socket.emit('evalAnswer', response);
  });

  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
})

server.listen(2000);
console.log('Server listening on port 2000');

// Default Entity class - We should pull this into a seperate file
var Entity = function(SpawnX,SpawnY){
  var self = {
    x: isNumeric(SpawnX) ? SpawnX : WIDTH/2,
    y: isNumeric(SpawnY) ? SpawnY : HEIGHT/2,
    spdX: 0,
    spdY: 0,
    id:""
  }

  self.update = function(){
    self.updatePosition();
  }

  self.updatePosition = function(){
    self.x += self.spdX;
    self.y += self.spdY;
  }

  self.getDistance = function(point){
    return Math.sqrt(Math.pow(self.x-point.x,2) + Math.pow(self.y-point.y,2));
  }

  return self;
}

// Player class (based on Entity) - We should pull this into a seperate file
var Player = function(id, playerData){
  var self = Entity();
  self.id = id; // equivalent to socket ID
  self.name = playerData.username;
  self.number = "" + Math.floor(10 * Math.random()); // random array value - likely a better way to do this
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.maxSpd = 10;

  self.hp = 100;
  self.hpMax = 100;

  //set the default update function to super_update (for use in new update function)
  var super_update = self.update;

  self.update = function(){
    self.updateSpd();
    super_update();

    if(self.pressingAttack){
      self.shootBullet(self.mouseAngle);
    }
  }

  //set the default updatePosition to super_updatePosition (for use in new updatePosition function)
  var super_updatePosition = self.updatePosition;

  self.updatePosition = function(){
    super_updatePosition();
    if(self.x < MINWIDTH){
      self.x = MINWIDTH;
    } else if(self.x > MAXWIDTH){
      self.x = MAXWIDTH;
    }

    if(self.y < MINHEIGHT){
      self.y = MINHEIGHT;
    } else if(self.y > MAXHEIGHT){
      self.y = MAXHEIGHT;
    }
  }

  //Update player speed based on player input (right, left, up, down)
  self.updateSpd = function(){
    if(self.pressingRight){
      self.spdX = self.maxSpd;
    }
    else if(self.pressingLeft){
      self.spdX = -self.maxSpd;
    }
    else {
      self.spdX = 0;
    }
    if(self.pressingUp){
      self.spdY = -self.maxSpd;
    }
    else if(self.pressingDown){
      self.spdY = self.maxSpd;
    }
    else{
      self.spdY = 0;
    }
  }

  // Sends the starting data to the client for this player
  self.getInitPack = function(){
    return {
      id:self.id,
      name: self.name,
      x: self.x,
      y: self.y,
      number: self.number,
      hp: self.hp,
      hpMax: self.hpMax,
      score: self.score,
      mouseAngle: self.mouseAngle
    }
  }

  // Sends the delta data to the client for this player (less data than Init)
  self.getUpdatePack = function(){
    return {
      id:self.id,
      x: self.x,
      y: self.y,
      hp: self.hp,
      score: self.score,
      mouseAngle: self.mouseAngle
    }
  }

  // Add this player to the server Player array
  Player.list[id] = self;
  initPack.players.push(self.getInitPack());
  return self;
}

// Initiates the player list
Player.list = {};

// Triggers when a new player socket is created
Player.onConnect = function(socket, playerData){
  let player = Player(socket.id, playerData);
  //Initiate Player
  Player.initPlayer(socket, player);
  //Initiate All other players
  Player.init(socket);

  socket.on('keyPress', function(data){
    if(data.inputId === 'left'){
      player.pressingLeft = data.state;
    }
    else if(data.inputId === 'right'){
      player.pressingRight = data.state;
    }
    else if(data.inputId === 'up'){
      player.pressingUp = data.state;
    }
    else if(data.inputId === 'down'){
      player.pressingDown = data.state;
    }
    else if(data.inputId === 'attack'){
      player.pressingAttack = data.state;
    }
    else if(data.inputId === 'mouseAngle'){
      player.mouseAngle = data.state;
    }
  });
}

// Triggers when a player socket disconnects
Player.onDisconnect = function(socket){
  removePack.players.push(socket.id);
  delete Player.list[socket.id];
}

Player.init = function(socket){
  let players = Player.getAllInitPack();
  let bullets = Bullet.getAllInitPack();

  socket.emit('init', {
    players:players,
    bullets:bullets
  });
}

Player.getAllInitPack = function(){
  let players = [];
  for(let i in Player.list){
    players.push(Player.list[i].getInitPack());
  }
  return players;
}

Player.initPlayer = function(socket, player){
  socket.emit('initPlayer', player.getInitPack());
}

// Updates all players and returns an array
Player.getPlayerPositions = function(){
  let playerArray = [];
  for(let i in Player.list){
    let player = Player.list[i];
    player.update();
    playerArray.push(player.getUpdatePack());
  }
  return playerArray;
}

// Sends data package to all players
Player.sendAllPlayers = function(message, data){
  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i];
    socket.emit(message, data);
  }
}

// Sends multiple data packages to all players
Player.sendAllPlayersMulti = function(fullPack){
  for(let i in SOCKET_LIST){
    let socket = SOCKET_LIST[i];
    for(let j in fullPack){
        socket.emit(fullPack[j].message, fullPack[j].data);
    }
  }
}

// Initiates the init and remove packs
var initPack = {players:[]};
var removePack = {players:[]};

// Main server loop
const TICKRATE = 32;
const TICKTIME = Math.ceil(1000/TICKRATE);
var lastUpdate = Date.now();
var frameCount = 0;
var frames = [];

mainUpdate();

function mainUpdate() {
  let start = Date.now();

  var pack = {
    players: Player.getPlayerPositions()
  }

  let fullPack = [
    {
      message:"init",
      data: initPack
    },
    {
      message:"update",
      data: pack
    },
    {
      message:"remove",
      data: removePack
    }
  ]

  Player.sendAllPlayersMulti(fullPack);

  initPack.players = [];
  removePack.players = [];


  // This is all for logging purposes to monitor server performance
  let now = Date.now();
  let execTime = now - start;
  let delta = now - lastUpdate;

  lastUpdate = now;
  frames.push({
    execTime: execTime,
    delta: delta
  });
  frameCount += 1;

  if(frameCount >= 100){
    let deltaSum = frames.reduce(function(a,b){
      return a+b.delta;
    },0);
    let execSum = frames.reduce(function(a,b){
      return a+b.execTime;
    },0);
    let average = execSum/frameCount;
    if(average <= TICKTIME){
      console.log(Object.keys(Player.list).length + " Players logged in. Last 100 frames took: " + colors.green(deltaSum + " ms") + ". Average frametime was: " + colors.green(average + "ms") +". Threshold average is: " + TICKTIME + " ms.");
    } else if (average <= TICKTIME*1.05) {
      console.log(Object.keys(Player.list).length + " Players logged in. Last 100 frames took: " + colors.yellow(deltaSum + " ms") + ". Average frametime was: " + colors.yellow(average + "ms") +". Threshold average is: " + TICKTIME + " ms.");
    } else {
      console.log(Object.keys(Player.list).length + " Players logged in. Last 100 frames took: " + colors.red(deltaSum + " ms") + ". Average frametime was: " + colors.red(average + "ms") +". Threshold average is: " + TICKTIME + " ms.");
    }
    frames = [];
    frameCount = 0;
  }

  let nextUpdateDelay = TICKTIME - execTime;
  if(nextUpdateDelay < 0){
    nextUpdateDelay = 2;
  }
  setTimeout(mainUpdate, nextUpdateDelay);
}
