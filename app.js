var CT = require('./src/constants.js');
var utils = require('./src/utils.js');
var database = require('./src/server/db.js');
var Player = require('./src/server/player.js');
var worldJSON = require('./src/server/mapData.js');
var Tile = require('./src/server/tile.js');
var Item = require('./src/server/item.js');
var Game = require('./src/server/game.js');

//console.log(mapJSON);

var colors = require('colors/safe');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {});

var SOCKET_LIST = {};
var playerList = {};
var tileMap = [];

var gameInstance = new Game();

gameInstance.setPlayerList(playerList);
gameInstance.setTileMap(tileMap);
gameInstance.setSocketServer(io);

function loadTileMap(callback) {
  for (let row in worldJSON.map) {
  	for (let col in worldJSON.map[row]) {

      var collision = worldJSON.map[row][col].ground.collision || worldJSON.map[row][col].entity.collision;
      var tile = new Tile(col, row, collision);

      // for testing
      if (col == 27 && row == 28) {
        tile.itemStack.push(17); // itemId == 17
      }

      // for testing
      if (col == 28 && row == 28) {
        tile.itemStack.push(17); // itemId == 17
      }

      // for testing
      if (col == 29 && row == 28) {
        tile.itemStack.push(18); // itemId == 18
      }

      tileMap.push(tile)
  	}
  }
  callback();
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/src/client/index.html');
});

app.get('/test', function(req,res){
  res.sendFile(__dirname + '/src/client/test.html');
})

app.use('/client', express.static(__dirname + '/src/client'));

io.sockets.on('connection', function(socket){
  console.log('socket connection.');
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on('login', function(data){
    database.isValidPassword(data, function(status, res){
      if(status){
        Player.onConnect(playerList, initPack, socket, res[0], tileMap);
        socket.emit('loginResponse', {success:true});
      } else {
        socket.emit('loginResponse', {success:false});
      }
    });
  });

  socket.on('register', function(data){
    database.isUsernameTaken(data, function(res){
      if(res){
        socket.emit('registerResponse', {success:false});
      } else {
        database.addUser(data,function(res){
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
    var playerName = playerList[socket.id].name;
    Player.sendAllPlayers(SOCKET_LIST, 'addToChat', playerName + ': ' + data);
    console.log('sent ' + data + ' to all players');
  });

  socket.on('evalServer', function(data){
    if(!CT.DEBUG){
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
    if(playerList[socket.id]){
      Player.onDisconnect(removePack, playerList, socket, tileMap);
    }
  });

  // move into Player class?
  socket.on('attack', function(data) {
    // If player is not logged in, do nothing.
    var player = playerList[data.attackingPlayer];
    if(!player){
      return;
    }

    console.log(data);
    console.log(100 * data.tileY + data.tileX);
    // look up the specified tileId from data in the tile playerArray
    var targetTile = tileMap[100 * Math.round(data.tileY) + Math.round(data.tileX)];
    console.log(targetTile);
    // make sure attacking player still exists
    if (player) {
      // make sure there is a player on the target tile that isnt the player who is trying to target
      if (targetTile.occupyingPlayer && (data.attackingPlayer != targetTile.occupyingPlayer.id)) {
        // the player on the target tile is already targetted
        if (player.target && playerList[data.attackingPlayer].target.id === targetTile.occupyingPlayer.id) {
          player.target = undefined;
        } else {
          player.target = targetTile.occupyingPlayer;
        }
      } else {
        player.target = undefined;
      }
    }
  });

  // also move to Player class
  socket.on('dragToTile', function(data) {
    var player = playerList[data.clickingPlayer];
    var mouseDownTile = tileMap[100 * data.fromTile.y + data.fromTile.x];
    var mouseUpTile = tileMap[100 * data.toTile.y + data.toTile.x];
    var fromInventorySlot = data.fromInventorySlot;

    // If player is not logged in, do nothing.
    if(!player){
      return;
    }

    // check that tiles are valid
    // ...
    // Item moved from player inventory to ground
    if (player.inventory.items[fromInventorySlot] && !mouseUpTile.collision){
      let temp = player.inventory.items[fromInventorySlot];
      mouseUpTile.itemStack.push(player.inventory.items[fromInventorySlot]);
      player.inventory.items[fromInventorySlot] = undefined;

      io.emit('itemMoved', {
        fromTile:{
          x: undefined,
          y: undefined
        },
        toTile: {
          x: data.toTile.x,
          y: data.toTile.y
        },
        item: temp
      });

      socket.emit('inventoryUpdate',{
        slotOne: fromInventorySlot,
        slotTwo: undefined,
        itemOne: player.inventory.items[fromInventorySlot],
        itemTwo: undefined
      });

    } else if ((data.toTile.x != data.fromTile.x ||
        data.toTile.y != data.fromTile.y) &&
        !mouseUpTile.collision            &&
        (Math.abs(player.x - data.fromTile.x) <= 1 && Math.abs(player.y - data.fromTile.y) <= 1)) {

          if (mouseDownTile.itemStack.length > 0) {
            // move the item from click tile to release tile
            mouseUpTile.pushItem(mouseDownTile.popItem());

            /*io.emit('itemMoved', {
              fromTile: {
                x: data.fromTile.x,
                y: data.fromTile.y
              },
              toTile: {
                x: data.toTile.x,
                y: data.toTile.y
              }
            });
            */

          } else if (mouseDownTile.occupyingPlayer && !mouseUpTile.hasCollision()) {
            // move the player from click tile to release tile (todo)
            if (Math.abs(mouseDownTile.occupyingPlayer.x - data.toTile.x) <= 1 && Math.abs(mouseDownTile.occupyingPlayer.y - data.toTile.y) <= 1) {
              mouseDownTile.occupyingPlayer.x = data.toTile.x;
              mouseDownTile.occupyingPlayer.y = data.toTile.y;

              mouseUpTile.occupyingPlayer = mouseDownTile.occupyingPlayer;
              mouseDownTile.occupyingPlayer = undefined;
            }
          }
    }

    console.log('~~~~~~');
    console.log(data.fromTile.x, data.fromTile.y);
    console.log(data.toTile.x, data.toTile.y);
  });

  socket.on('dragToInventory', function(data) {
    var player = playerList[data.clickingPlayer];
    var mouseDownTile = tileMap[100 * data.fromTile.y + data.fromTile.x];
    var fromInventorySlot = data.fromInventorySlot;
    var toInventorySlot = data.toInventorySlot;

    // If player is not logged in, do nothing.
    if(!player){
      return;
    }

    // check that tiles are valid
    // ...
    if(player.inventory.items[fromInventorySlot]){
      console.log("moving inventory item");
      let temp = player.inventory.items[toInventorySlot];
      player.inventory.items[toInventorySlot] = player.inventory.items[fromInventorySlot];
      player.inventory.items[fromInventorySlot] = temp || undefined;
    } else if((Math.abs(player.x - data.fromTile.x) <= 1 && Math.abs(player.y - data.fromTile.y) <= 1)){
      if (mouseDownTile.itemStack.length > 0){
        temp = player.inventory.items[toInventorySlot];

        player.inventory.items[toInventorySlot] = mouseDownTile.itemStack.pop();

        if(temp){
          mouseDownTile.itemStack.push(temp);
        }

        io.emit('itemMoved', {
          fromTile: {
            x: data.fromTile.x,
            y: data.fromTile.y
          },
          toTile: temp ? {
            x: data.fromTile.x,
            y: data.fromTile.y
          } : undefined,
          item: temp
        });
      }
    }

    console.log(fromInventorySlot,toInventorySlot, player.inventory.items[fromInventorySlot], player.inventory.items[toInventorySlot]);
    socket.emit('inventoryUpdate',{
      slotOne: fromInventorySlot,
      slotTwo: toInventorySlot,
      itemOne: player.inventory.items[fromInventorySlot],
      itemTwo: player.inventory.items[toInventorySlot]
    });

    console.log('~~~~~~');
    console.log(data.fromTile.x, data.fromTile.y);
    console.log(toInventorySlot);
  });

  socket.on('useItem', function(data) {
    let itemID;
    let player = playerList[data.playerID];

    if (data.itemUsedFromInventory) {
      itemID = player.getInventoryItem(data.inventorySlot);
    } else { // item used from tile
      itemTile = tileMap[CT.MAP_WIDTH * data.targetTileY + data.targetTileX];
      itemID = itemTile.getTopItem();
    }

    if (itemID) Item.onUseFunctionTable[itemID](data);
  });
})

server.listen(2000);
console.log('Server listening on port 2000');

// Initiates the init and remove packs
var initPack = {players:[]};
var removePack = {players:[]};

// Main server loop
const TICKRATE = 32;
const TICKTIME = Math.ceil(1000/TICKRATE);
var lastUpdate = Date.now();
var frameCount = 0;
var frames = [];

loadTileMap(mainUpdate);

function mainUpdate() {
  let start = Date.now();

  Player.execPlayerAttacks(playerList);

  var pack = {
    players: Player.getPlayerPositions(playerList, tileMap),
    creatures: gameInstance.getCreatureUpdates(),
    tiles: gameInstance.getTileUpdates()
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

  Player.sendAllPlayersMulti(SOCKET_LIST, fullPack);

  gameInstance.clearUpdatePacks();
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
      console.log(Object.keys(playerList).length + " Players logged in. Last 100 frames took: " + colors.green(deltaSum + " ms") + ". Average frametime was: " + colors.green(average + "ms") +". Threshold average is: " + TICKTIME + " ms.");
    } else if (average <= TICKTIME*1.05) {
      console.log(Object.keys(playerList).length + " Players logged in. Last 100 frames took: " + colors.yellow(deltaSum + " ms") + ". Average frametime was: " + colors.yellow(average + "ms") +". Threshold average is: " + TICKTIME + " ms.");
    } else {
      console.log(Object.keys(playerList).length + " Players logged in. Last 100 frames took: " + colors.red(deltaSum + " ms") + ". Average frametime was: " + colors.red(average + "ms") +". Threshold average is: " + TICKTIME + " ms.");
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
