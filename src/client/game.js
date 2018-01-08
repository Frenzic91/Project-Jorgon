var socket = io();

var scale = 1;

var playerList = {};
var creatureList = [];
var tileData = [];
var animations = [];

window.onbeforeunload = function() { return "You work will be lost."; };

var canvasGround = document.getElementById('ctxGround');
canvasGround.onselectstart = function(){return false;};
var ctxGround = document.getElementById("ctxGround").getContext("2d");

var canvasEntities = document.getElementById('ctxEntities');
canvasEntities.onselectstart = function(){return false;};
var ctxEntities = document.getElementById("ctxEntities").getContext("2d");

var canvasHud = document.getElementById('ctxHUD');
canvasHud.onselectstart = function(){return false;};
var ctxHUD = document.getElementById("ctxHUD").getContext("2d");

var hud;
var map;
var entities;

ctxEntities.scale(scale,scale);
ctxGround.scale(scale,scale);

var playerName = "";
var playerX = 0;
var playerY = 0;
var playerXPixels = 0;
var playerYPixels = 0;
var playerID = 0;

let xTrans = 0;
let yTrans = 0;

var mouseX = 0;
var mouseY = 0;
var mouseClicked = false;
var mouseDownTileInfo = {x: -1, y: -1};
var mouseDownInventorySlot = undefined;

var pressingUp = false;
var pressingDown = false;
var pressingLeft = false;
var pressingRight = false;

var loggedIn = false;
var loaded = false;

// Map sprite details
let loopHeight = 0;
let loopWidth = 0;
let width = 0;
let height = 0;
let imageHeight = 0;

var minFPS = 999;
var fpsDelay = Date.now();

var hudHPWidth = 26;
var hudHPLength = 62;
var hudOutlineThickness = 2;
var hudHPMargin = 20;
var hpBarWidth = 30;

function drawTestMap(testMap){
  ctxGround.fillRect(-WIDTH/2,-HEIGHT/2,2*WIDTH,2*HEIGHT);
}

function translateView(){
  xTrans = WIDTH/(2) - playerXPixels*scale;
  yTrans = HEIGHT/(2) - playerYPixels*scale;
  ctxEntities.save();
  ctxGround.save();
  ctxEntities.translate(xTrans,yTrans);
  ctxGround.translate(xTrans,yTrans);
}

// Initialize the actual player
socket.on('initPlayer',function(data){
  playerName = data.name;
  playerX = data.x;
  playerY = data.y;
  playerID = data.id;
  inventory = data.inventory;
  drawTestMap();
  hud = new Hud(ctxHUD);
  map = new Map(ctxGround,worldJSON);
  entities = new Entities(ctxEntities,worldJSON);
  entities.initializeAllEntities();
  loggedIn = true;
});

//init
socket.on('init', function(data){
  // { player:}w
  for(let i = 0; i < data.players.length; i++){
    let player = new Player(data.players[i]);
    playerList[player.id] = player;
  }

  // 'init' event is also being sent every server frame so check is needed until conflicting names changed
  if (data.tileData) {
    let tileDataRaw = JSON.parse(data.tileData);
    for (let t in tileDataRaw) {
      tileData.push(new Tile(tileDataRaw[t].x, tileDataRaw[t].y, tileDataRaw[t].occupyingPlayer, tileDataRaw[t].collision, tileDataRaw[t].itemStack));
    }
  }

  if (data.creatures) {
    let creatureDataRaw = JSON.parse(data.creatures);
    for(let i = 0; i < creatureDataRaw.length; i++){
      creatureList.push(creatureDataRaw[i]);
    }
    console.log(creatureList);
  }
})

//updated
socket.on('update', function(data){
  for(let i = 0; i < data.players.length; i++){
    let pack = data.players[i];
    let p = playerList[pack.id];
    if(p){
      if(pack.x !== undefined){
        p.x = pack.x;
        p.screenX = pack.x * 64;
      }
      if(pack.y !== undefined){
        p.y = pack.y;
        p.screenY = pack.y * 64;
      }
      if(pack.hp !== undefined){
        p.hp = pack.hp;
      }
      if(pack.score !== undefined){
        p.score = pack.score;
      }
      if(pack.mouseAngle !== undefined){
        p.mouseAngle = pack.mouseAngle;
      }
        p.attackTarget = pack.attackTarget;
    }
  }

  // update tiles
  for (let tileUpdatePacket in data.tiles) {
    // why are these strings and the player info above isnt?
    let x = parseInt(data.tiles[tileUpdatePacket].x);
    let y = parseInt(data.tiles[tileUpdatePacket].y);

    let updateTile = tileData[100 * y + x];

    if (data.tiles[tileUpdatePacket].popItem) {
      updateTile.popItem();
    } else if (data.tiles[tileUpdatePacket].pushItem){
      let itemID = data.tiles[tileUpdatePacket].itemID;
      updateTile.pushItem(itemID);
    } else if (data.tiles[tileUpdatePacket].setOccupyingPlayer) {
      let occupyingPlayer = playerList[data.tiles[tileUpdatePacket].playerID];
      updateTile.setOccupyingPlayer(occupyingPlayer);
    } else if (data.tiles[tileUpdatePacket].removeOccupyingPlayer)  {
      updateTile.removeOccupyingPlayer();
    }
  }

});

//remove
socket.on('remove', function(data){
  for(let i = 0; i < data.players.length; i++){
    delete playerList[data.players[i]];
  }
})

socket.on('itemMoved', function(data) {
  var fromTile = tileData[100 * data.fromTile.y + data.fromTile.x];

  if(data.toTile){
    var toTile = tileData[100 * data.toTile.y + data.toTile.x];

    if(data.fromTile.x && data.fromTile.y && !data.item){
      toTile.itemStack.push(fromTile.itemStack.pop());
    } else {
      console.log("dropped item");
      if(fromTile){
        toTile.itemStack.pop();
      }
      toTile.itemStack.push(data.item);
    }
  } else if(fromTile.itemStack) {
    fromTile.itemStack.pop();
  }
});

socket.on('inventoryUpdate', function(data) {
  if(data.slotOne !== undefined){
    inventory.items[data.slotOne] = data.itemOne;
  }
  if(data.slotTwo !== undefined){
    inventory.items[data.slotTwo] = data.itemTwo;
  }
});

socket.on('recalculatePath', function(data) {
  //let path = findPath({x: playerX, y: playerY}, data.endCoord);
  let path = findPath(data.startCoord, data.endCoord);
  console.log(path);
  socket.emit('moveToTile', {
    playerID,
    path
  });
});

document.onkeydown = function(event){
  if(!chatFocused){
    if(event.keyCode === 68) { // d
      socket.emit('keyPress', {inputId:'right', state: true});
      pressingRight = true;
    }
    else if(event.keyCode === 83) { // s
      socket.emit('keyPress', {inputId: 'down', state: true});
      pressingDown = true;
    }
    else if(event.keyCode === 65) { // a
      socket.emit('keyPress', {inputId: 'left', state: true});
      pressingLeft = true;
    }
    else if(event.keyCode === 87) { // w
      socket.emit('keyPress', {inputId: 'up', state: true});
      pressingUp = true;
    }
    else if(event.keyCode === 87) { // w
      socket.emit('keyPress', {inputId: 'up', state: true});
      pressingUp = true;
    }
  }
}

document.onkeyup = function(event){
  if(event.keyCode === 68) { // d
    socket.emit('keyPress', {inputId:'right', state: false});
    pressingRight = false;
  }
  else if(event.keyCode === 83) { // s
    socket.emit('keyPress', {inputId: 'down', state: false});
    pressingDown = false;
  }
  else if(event.keyCode === 65) { // a
    socket.emit('keyPress', {inputId: 'left', state: false});
    pressingLeft = false;
  }
  else if(event.keyCode === 87) { // w
    socket.emit('keyPress', {inputId: 'up', state: false});
    pressingUp = false;
  }
  else if(event.keyCode === 13) { // Enter
    toggleChat();
  }
  else if(event.keyCode === 73) { // I
    hud.toggleInventory();
  }
}

document.onmousedown = function(event){
  if(!chatFocused){

    //console.log(hud.getInventorySlot(mouseX, mouseY));
    // figure out which tile was clicked
    let currentTileX = playerX;
    let currentTileY = playerY;

    // Offset to account for interp
    let offSetPixelsX = playerX * TILESIZE - playerXPixels;
    let offSetPixelsY = playerY * TILESIZE - playerYPixels;

    // Calculate clicked tile distance -- includes offset based on scale (zoom)
    let distFromTargetInTilesX = Math.round(((mouseX - WIDTH/2)/scale - offSetPixelsX ) / 64);
    // Offset TILESIZE/4 because map is offset -- includes offset based on scale (zoom)
    let distFromTargetInTilesY = Math.round(((mouseY - HEIGHT/2)/scale - offSetPixelsY  - TILESIZE/4) / 64);

    let targetTileX = currentTileX + distFromTargetInTilesX;
    let targetTileY = currentTileY + distFromTargetInTilesY;

    // shift-clicking attacks for now
    if(loggedIn){
      if (event.shiftKey) {
        socket.emit('attack', {attackingPlayer: playerID, tileX: targetTileX, tileY: targetTileY});
      } else if (event.button == 2) {
        if (hud.inventoryEnabled && hud.isMouseOverInventory(mouseX, mouseY)) {
          let inventorySlot = hud.getInventorySlot(mouseX,mouseY);
          socket.emit('useItem', {playerID, itemUsedFromInventory: true, inventorySlot});
          if (inventory.items[inventorySlot] == 18) {
            playerList[playerID].isCastingSpell = true;
          }
        } else { /* mouse over tile */
          socket.emit('useItem', {playerID, itemUsedFromInventory: false, targetTileX, targetTileY});
          let tile = tileData[MAP_WIDTH * targetTileY + targetTileX];
          if (tile.itemStack[tile.itemStack.length - 1] == 18) {
            playerList[playerID].isCastingSpell = true;
          }
        }
      } else {
        //console.log('Left-click registered');
        //socket.emit('playerMouseDown', {clickingPlayer: playerID, tileX: targetTileX, tileY: targetTileY});
        mouseDownTileInfo['x'] = targetTileX;
        mouseDownTileInfo['y'] = targetTileY;
        mouseDownInventorySlot = hud.getInventorySlot(mouseX,mouseY);
      }
    }
    //socket.emit('keyPress', {inputId:'attack', state:true});
    mouseClicked = true;
  }
}

document.onmouseup = function(event){
  //socket.emit('keyPress', {inputId: 'attack', state:false});

  // temporary copy pasta from onmousedown
  // figure out which tile was clicked
  let currentTileX = playerX;
  let currentTileY = playerY;

  // Offset to account for interp
  let offSetPixelsX = playerX * TILESIZE - playerXPixels;
  let offSetPixelsY = playerY * TILESIZE - playerYPixels;

  // Calculate clicked tile distance -- includes offset based on scale (zoom)
  let distFromTargetInTilesX = Math.round(((mouseX - WIDTH/2)/scale - offSetPixelsX ) / 64);
  // Offset TILESIZE/4 because map is offset -- includes offset based on scale (zoom)
  let distFromTargetInTilesY = Math.round(((mouseY - HEIGHT/2)/scale - offSetPixelsY  - TILESIZE/4) / 64);

  let targetTileX = currentTileX + distFromTargetInTilesX;
  let targetTileY = currentTileY + distFromTargetInTilesY;

  if (loggedIn) {
    //socket.emit('playerMouseUp', {clickingPlayer: playerID, tileX: targetTileX, tileY: targetTileY});
    // If player dragged an item over the inventory
    if(hud.inventoryEnabled && hud.isMouseOverInventory(mouseX, mouseY)){
      console.log(mouseDownInventorySlot, hud.getInventorySlot(mouseX,mouseY));
      socket.emit('dragToInventory', {
        clickingPlayer: playerID,
        fromTile: {
          x: mouseDownTileInfo.x,
          y: mouseDownTileInfo.y
        },
        fromInventorySlot: mouseDownInventorySlot,
        toInventorySlot: hud.getInventorySlot(mouseX,mouseY)
      });
    } else { //If player dragged something to a tile (player or item)
      if (mouseDownTileInfo.x == targetTileX && mouseDownTileInfo.y == targetTileY) {
        // pathfinding
        // socket.emit('moveToTile', {
        //   playerID,
        //   fromTile: {x: playerX, y: playerY},
        //   toTile: {x: targetTileX, y: targetTileY}
        // });
        if  (!tileData[MAP_WIDTH * targetTileY + targetTileX].hasCollision()) {
          let path = findPath({x: playerX, y: playerY}, {x: targetTileX, y: targetTileY});
          socket.emit('moveToTile', {
            playerID,
            path
          });
        }
      } else {
        socket.emit('dragToTile', {
          clickingPlayer: playerID,
          fromTile: {
            x: mouseDownTileInfo.x,
            y: mouseDownTileInfo.y
          },
          fromInventorySlot: mouseDownInventorySlot,
          toTile: {
            x: targetTileX,
            y: targetTileY
          }
        });
      }
    }
  }

  mouseClicked = false;
}

document.onmousemove = function(event){
  mouseX = event.clientX;
  mouseY = event.clientY;
  updateAngle();
}

function updateAngle(){
  //let x = mouseX - playerX;
  //let y = mouseY - playerY;
  let x = mouseX - WIDTH/2;
  let y = mouseY - HEIGHT/2;
  mouseAngle = Math.atan2(y,x) / Math.PI * 180;
  //socket.emit('keyPress', {inputId:'mouseAngle', state:mouseAngle});
}

function isPlayerMoving(){
    return pressingRight | pressingDown | pressingLeft | pressingUp | false;
}

document.addEventListener('mousewheel', function(e) {
  if(!chatFocused){
    setZoom(e.deltaY);
  }
}, false)

function setZoom(delta){
  if(delta < 0){
    scale+= 0.2;
    if(scale > MAXSCALE){
      scale = MAXSCALE;
    }
  } else {
    scale-= 0.2;
    if(scale < MINSCALE){
      scale = MINSCALE;
    }
  }
}

function sortPlayersByY(){
  let sortedList = [];
  for(let i in playerList){
    sortedList.push({
      key: i,
      y: playerList[i].y
    });
  }
  sortedList.sort(function(a,b){
    return a.y - b.y;
  });
  return sortedList;
}

function isLoaded(){
  if(loaded){
    return true;
  } else {
    for(let i in playerImg){
      for(let j in playerImg[i]){
        if(!playerImg[i][j].isLoaded){
          console.log('character sprite not loaded!');
          return false;
        }
      }
    }
    loaded = true;
    return true;
  }
}

let frameRate = 100;
let updateCount = 0;
let fpsTimer = Date.now();
let fpsCount = 0;
let fps = 0;
let debug = false;
let debugFrames = [0,0,0,0,0,0];
let debugCount = 100;
let debugTimer;
let frameDelay = Math.floor(1000/frameRate)

//Game update loop
setInterval(function() {
  // Update local player position
  if(debug && debugCount >= 100){
    console.log("First pass player drawing took:" + debugFrames[0] + "ms across " + debugCount + " frames. Average time per frame = " + debugFrames[0]/debugCount + "ms." );
    console.log("Drawing entities took:" + debugFrames[1] + "ms across " + debugCount + " frames. Average time per frame = " + debugFrames[1]/debugCount + "ms." );
    console.log("Second pass player drawing took:" + debugFrames[2] + "ms across " + debugCount + " frames. Average time per frame = " + debugFrames[2]/debugCount + "ms." );
    console.log("Drawing map took:" + debugFrames[3] + "ms across " + debugCount + " frames. Average time per frame = " + debugFrames[3]/debugCount + "ms." );
    console.log("Drawing HUD took:" + debugFrames[4] + "ms across " + debugCount + " frames. Average time per frame = " + debugFrames[4]/debugCount + "ms." );
    console.log("Total frame took:" + debugFrames[5] + "ms across " + debugCount + " frames. Average time per frame = " + debugFrames[5]/debugCount + "ms." );
    debugFrames = [0,0,0,0,0,0];
    debugCount = 0;
  }
  debugTimer = Date.now();
  debugTotalTimer = Date.now();

  if(loggedIn && isLoaded()){
    playerXPixels = playerList[playerID].xOld;
    playerYPixels = playerList[playerID].yOld;
    playerX = playerList[playerID].x;
    playerY = playerList[playerID].y;
    // Update aim
    if(updateCount >= 50){
      updateAngle();
    }

    translateView();
    ctxEntities.scale(scale,scale);
    ctxGround.scale(scale,scale);

    // Clear players and objects (trees, etc.)
    ctxEntities.clearRect(playerXPixels - WIDTH/2,playerYPixels - HEIGHT/2,WIDTH,HEIGHT);

    // Draw players in order from top to bottom of screen
    entities.drawItems(playerX, playerY);

    let sortedList = sortPlayersByY();
    for(let i in sortedList){
      playerList[sortedList[i].key].draw();
      if (playerList[sortedList[i].key].isCastingSpell) {
        //playerList[sortedList[i].key].drawSpellEffectOnPlayer();
        let newAnimation = new Animation(spellEffectImg.effect.healeffect, playerList[sortedList[i].key], ctxEntities);
        animations.push(newAnimation);
        playerList[sortedList[i].key].isCastingSpell = false;
      }
    }

    for (let c in creatureList) {
      ctxEntities.drawImage(playerImg.player.playerFull, index*57 || 57*0, 57*this.direction, 57, 57, creatureList[c].x*64-width/2, creatureList[c].y*64-height/2, 57, 57);
    }
    // let initTime = Date.now();
    // while (Date.now() - initTime < 500);

    if(debug){
      debugFrames[0] += (Date.now() - debugTimer);
      debugTimer = Date.now();
    }

    // Draw world entities (trees, etc.)
    entities.drawEntities(playerX, playerY);
    if(debug){
      debugFrames[1] += (Date.now() - debugTimer);
      debugTimer = Date.now();
    }

    Animation.updateAnimations();

    for(let i in sortedList){
      playerList[sortedList[i].key].drawOccludedPlayer();
    }
    if(debug){
      debugFrames[2] += (Date.now() - debugTimer);
      debugTimer = Date.now();
    }

    ctxEntities.restore();

    map.drawGround();
    ctxGround.restore();

    if(debug){
      debugFrames[3] += (Date.now() - debugTimer);
      debugTimer = Date.now();
    }

    hud.drawHud(sortedList);

    if(debug){
      debugFrames[4] += (Date.now() - debugTimer);
      debugTimer = Date.now();
    }

    fpsCount++;
    let now = Date.now();
    // if((now - fpsTimer) >= 1000){
    //   fps = Math.floor(fpsCount/((now - fpsTimer)/1000));
    //   fpsCount = 0;
    //   fpsTimer = Date.now();
    // }
    if((now - fpsTimer) >= 1000){
      fps = fpsCount;
      fpsCount = 0;
      fpsTimer = Date.now();
    }

    if(debug){
      debugFrames[5] += (Date.now() - debugTotalTimer);
      debugCount++;
    }

  }

}, frameDelay);
