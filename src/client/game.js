var socket = io();

var scale = 1;

var playerList = {};
var tileData; // obtained from server on connect

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
    tileData = JSON.parse(data.tileData);
    console.log(tileData);
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

});

//remove
socket.on('remove', function(data){
  for(let i = 0; i < data.players.length; i++){
    delete playerList[data.players[i]];
  }
})

socket.on('itemMoved', function(data) {
  console.log('an item was moved!');

  var toTile = tileData[100 * data.toTile.y + data.toTile.x];
  var fromTile = tileData[100 * data.fromTile.y + data.fromTile.x];

  console.log(fromTile);
  console.log(toTile);

  toTile.itemStack.push(fromTile.itemStack.pop());
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
}

document.onmousedown = function(event){
  console.log(event);
  if(!chatFocused){
    // figure out which tile was clicked
    var currentTileX = playerX;
    var currentTileY = playerY;

    // Calculate clicked tile distance
    var distFromTargetInTilesX = Math.round((mouseX - WIDTH/2) / 64);
    // Offset TILESIZE/4 because map is offset
    var distFromTargetInTilesY = Math.round((mouseY - HEIGHT/2 - TILESIZE/4) / 64);

    var targetTileX = currentTileX + distFromTargetInTilesX;
    var targetTileY = currentTileY + distFromTargetInTilesY;

    console.log(targetTileX);
    console.log(targetTileY);

    // shift-clicking attacks for now
    if(loggedIn){
      if (event.shiftKey) {
        console.log('Attack!');
        socket.emit('attack', {attackingPlayer: playerID, tileX: targetTileX, tileY: targetTileY});
      } else {
        console.log('Left-click registered');
        socket.emit('playerMouseDown', {clickingPlayer: playerID, tileX: targetTileX, tileY: targetTileY});
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
  var currentTileX = playerX;
  var currentTileY = playerY;

  // Calculate clicked tile distance
  var distFromTargetInTilesX = Math.round((mouseX - WIDTH/2) / 64);
  // Offset TILESIZE/4 because map is offset
  var distFromTargetInTilesY = Math.round((mouseY - HEIGHT/2 - TILESIZE/4) / 64);

  var targetTileX = currentTileX + distFromTargetInTilesX;
  var targetTileY = currentTileY + distFromTargetInTilesY;

  socket.emit('playerMouseUp', {clickingPlayer: playerID, tileX: targetTileX, tileY: targetTileY});

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

let frameRate = 144;
let updateCount = 0;
let fpsTimer = Date.now();
let fpsCount = 0;
let fps = 0;

//Game update loop
setInterval(function() {
  // Update local player position
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
    let sortedList = sortPlayersByY();
    for(let i in sortedList){
      playerList[sortedList[i].key].draw();
    }
    // Draw world entities (trees, etc.)
    entities.drawEntities(playerX, playerY);

    for(let i in sortedList){
      playerList[sortedList[i].key].drawOccludedPlayer();
    }

    ctxEntities.restore();

    map.drawGround();
    ctxGround.restore();

    ctxHUD.clearRect(0,0,WIDTH,HEIGHT);
    hud.drawHud(sortedList);

    fpsCount++;
    if(Date.now() - fpsTimer >= 1000){
      let now = Date.now();
      fps = Math.floor(fpsCount/((now - fpsTimer)/1000));
      fpsCount = 0;
      fpsTimer = Date.now();
    }
  }

}, 1000/frameRate);
