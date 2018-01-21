var CT = require('./src/constants.js');
var Utils = require('./src/utils.js');
var database = require('./src/server/db.js');
var Player = require('./src/server/player.js');
var Creature = require('./src/server/creature.js');
var worldJSON = require('./src/server/mapData.js');
var Tile = require('./src/server/tile.js');
var ItemJS = require('./src/server/item.js');
var Item = ItemJS.Item;
var Game = require('./src/server/game.js');
var findPath = require('./src/server/pathfinder.js');


//console.log(mapJSON);

var colors = require('colors/safe');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {});

var SOCKET_LIST = {};
var playerList = {};
var creatureList = {};
var tileMap = [];

let testCreature = new Creature();
let testCreatureID = testCreature.number;
creatureList[testCreatureID] = testCreature;

var gameInstance = new Game();

gameInstance.setPlayerList(playerList);
gameInstance.setCreatureList(creatureList);
gameInstance.setTileMap(tileMap);
gameInstance.setSocketServer(io);
gameInstance.setSocketList(SOCKET_LIST);

function loadTileMap(callback) {
  for (let row in worldJSON.map) {
  	for (let col in worldJSON.map[row]) {

      var collision = worldJSON.map[row][col].ground.collision || worldJSON.map[row][col].entity.collision;
      var tile = new Tile(col, row, collision, []);

      // for testing
      if (col == 27 && row == 28) {
        tile.itemStack.push(new Item(17)); // itemId == 17
      }

      // for testing
      if (col == 28 && row == 28) {
        tile.itemStack.push(new Item(17)); // itemId == 17
      }

      // for testing
      if (col == 29 && row == 28) {
        tile.itemStack.push(new Item(18)); // itemId == 18
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
    var player = playerList[socket.id];

    if(!player){
      return;
    }

    var playerName = player.name;

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
    var player = playerList[socket.id];
    var mouseDownTile = tileMap[100 * data.fromTile.y + data.fromTile.x];
    var mouseUpTile = tileMap[100 * data.toTile.y + data.toTile.x];
    var fromInventorySlot = data.fromInventorySlot;
    var fromEquipmentSlot = data.fromEquipmentSlot;

    // If player is not logged in, do nothing.
    if(!player){
      return;
    }

    // check that tiles are valid
    // ...
    // Item moved from player inventory to ground
    if ((player.inventory.items[fromInventorySlot] || player.equipment[fromEquipmentSlot]) && !mouseUpTile.collision){
      if(player.inventory.items[fromInventorySlot]){
        mouseUpTile.pushItem(player.inventory.items[fromInventorySlot]);
        player.inventory.items[fromInventorySlot] = undefined;
      } else if(player.equipment[fromEquipmentSlot]){
        mouseUpTile.pushItem(player.equipment[fromEquipmentSlot]);
        player.unequipItem(fromEquipmentSlot);
      }

      socket.emit('inventoryUpdate',{
        slotOne: fromInventorySlot,
        slotTwo: undefined,
        itemOne: player.inventory.items[fromInventorySlot],
        itemTwo: undefined,
        fromEquipmentSlot: fromEquipmentSlot,
        equipmentFrom: player.equipment[fromEquipmentSlot]
      });

    } else if ((data.toTile.x != data.fromTile.x ||
        data.toTile.y != data.fromTile.y) &&
        !mouseUpTile.collision            &&
        (Math.abs(player.x - data.fromTile.x) <= 1 && Math.abs(player.y - data.fromTile.y) <= 1)) {

          if (mouseDownTile.itemStack.length > 0) {
            // move the item from click tile to release tile
            mouseUpTile.pushItem(mouseDownTile.popItem());

          } else if (mouseDownTile.occupyingPlayer && !mouseUpTile.hasCollision()) {
            // move the player from click tile to release tile (todo)
            if (Math.abs(mouseDownTile.occupyingPlayer.x - data.toTile.x) <= 1 && Math.abs(mouseDownTile.occupyingPlayer.y - data.toTile.y) <= 1) {
              mouseDownTile.occupyingPlayer.x = data.toTile.x;
              mouseDownTile.occupyingPlayer.y = data.toTile.y;

              //mouseUpTile.occupyingPlayer = mouseDownTile.occupyingPlayer;
              //mouseDownTile.occupyingPlayer = undefined;
              mouseUpTile.setOccupyingPlayer(mouseDownTile.getOccupyingPlayer());
              mouseDownTile.removeOccupyingPlayer();
            }
          }
    }
  });

  socket.on('dragToInventory', function(data) {
    var player = playerList[socket.id];
    var mouseDownTile = tileMap[100 * data.fromTile.y + data.fromTile.x];
    var fromInventorySlot = data.fromInventorySlot;
    var toInventorySlot = data.toInventorySlot;
    var toEquipmentSlot = data.toEquipmentSlot;
    var fromEquipmentSlot = data.fromEquipmentSlot;

    console.log("fromInventorySlot:", fromInventorySlot, ", toInventorySlot:", toInventorySlot, "toEquipmentSlot:", toEquipmentSlot, "fromEquipmentSlot:", fromEquipmentSlot);

    // If player is not logged in, do nothing.
    if(!player){
      return;
    }

    // check that tiles are valid
    // ...
    if(player.inventory.items[fromInventorySlot]) { // If dragging from inventory
      console.log("moving inventory item");
      let temp;
      if(toInventorySlot){
        temp = player.inventory.items[toInventorySlot];
        player.inventory.items[toInventorySlot] = player.inventory.items[fromInventorySlot];
      } else if(toEquipmentSlot){
        console.log("equiping item");
        temp = player.equipment[toEquipmentSlot];
        if(!player.equipItem(player.inventory.items[fromInventorySlot],toEquipmentSlot)){
          return;
        }
        //player.equipment[toEquipmentSlot] = player.inventory.items[fromInventorySlot];
        console.log(toEquipmentSlot, player.equipment);
      }

      player.inventory.items[fromInventorySlot] = temp || undefined;
    } else if(player.equipment[fromEquipmentSlot] && toInventorySlot) { // If dragging from equipment
        console.log("moving equipment item");
        let temp = player.inventory.items[toInventorySlot];
        if(temp){
          if(!player.equipItem(temp,fromEquipmentSlot)){
            return;
          }
        }

        player.inventory.items[toInventorySlot] = player.equipment[fromEquipmentSlot];
        player.unequipItem(fromEquipmentSlot);
        //player.equipment[fromEquipmentSlot] = temp || undefined;
    } else if((Math.abs(player.x - data.fromTile.x) <= 1 && Math.abs(player.y - data.fromTile.y) <= 1)){
      if (mouseDownTile.itemStack.length > 0){
        let temp;
        if(toInventorySlot){
          temp = player.inventory.items[toInventorySlot];
          player.inventory.items[toInventorySlot] = mouseDownTile.itemStack.pop();
        } else if(toEquipmentSlot){
          temp = player.equipment[toEquipmentSlot];
          tempTile = mouseDownTile.itemStack.pop()
          if(!player.equipItem(tempTile,toEquipmentSlot)){
            mouseDownTile.itemStack.push(tempTile);
            return;
          }
        }

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
      itemTwo: player.inventory.items[toInventorySlot],
      fromEquipmentSlot: fromEquipmentSlot,
      toEquipmentSlot: toEquipmentSlot,
      equipmentFrom: player.equipment[fromEquipmentSlot],
      equipmentTo: player.equipment[toEquipmentSlot]
    });
  });

  socket.on('useItem', function(data) {
    let itemID;
    let player = playerList[socket.id];

    if(!player){
      return;
    }

    if (data.itemUsedFromInventory) {
      itemID = player.getInventoryItem(data.inventorySlot);
    } else { // item used from tile
      itemTile = tileMap[CT.MAP_WIDTH * data.targetTileY + data.targetTileX];
      itemID = itemTile.getTopItem();
    }

    if (itemID) ItemJS.onUseFunctionTable[itemID.id](data);
  });

  socket.on('moveToTile', function(data) {
    let gameInstance = new Game()
    let player = gameInstance.getPlayerList()[socket.id];

    if(!player){
      return;
    }

    // verify that the path is valid
    if (data.path) {
      player.setPath(data.path);
    }

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

  // let init = Date.now();
  // let pahf = findPath({x: 25, y: 25}, {x: 125, y: 125});
  // //console.log(pahf);
  // console.log(Date.now() - init);

  let start = Date.now();

  Player.execPlayerAttacks(playerList);
  Creature.simulateAll();

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
