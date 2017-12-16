var socket = io();

//Game
const WIDTH = 1280;
const HEIGHT = 720;
const PLAYERSPRITEWIDTH = 57;
const PLAYERSPRITEHEIGHT = 57;
const MININTERP = 0.01;
const MAXINTERP = 0.02;
const BLOODDURATION = 10000;
var ANIMATIONTIME = 100;
var scale = 1;
const MAXSCALE = 3;
const MINSCALE = 1;

window.onbeforeunload = function() { return "You work will be lost."; };

var canvas = document.getElementById('ctx');
canvas.onselectstart = function(){return false;}
var ctx = document.getElementById("ctx").getContext("2d");

var canvasbg = document.getElementById('ctxbg');
canvasbg.onselectstart = function(){return false;};
var ctxbg = document.getElementById("ctxbg").getContext("2d");

var canvashud = document.getElementById('ctxhud');
canvashud.onselectstart = function(){return false;};
var ctxhud = document.getElementById("ctxhud").getContext("2d");

ctx.scale(scale,scale);
ctxbg.scale(scale,scale);

var playerName = "";
var playerX = 0;
var playerY = 0;
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

// Hud details
let hudHPWidth = 26;
let hudHPLength = 62;
let hudOutlineThickness = 2;
let hudHPMargin = 20;

var charSprites = [
  {
    type: "player",
    name: "playerFull",
    src: "client/images/player_full_57.png"
  }
];

var mapSprites = [
  {
    type: "grass",
    name: "grass1",
    src: "client/images/world/grass_isometric3.png"
  },
  {
    type: "grass",
    name: "grass2",
    src: "client/images/world/grass_isometric3-1.png"
  },
  {
    type: "blood",
    name: "blood1",
    src:"client/images/world/blood_1.png"
  },
  {
    type: "blood",
    name: "blood2",
    src:"client/images/world/blood_2.png"
  }
];

var hudSprites = [
  {
    type: "crosshair",
    name: "crosshair",
    src: "client/images/hud/crosshair2.png"
  },
  {
    type: "crosshair",
    name: "cursor",
    src: "client/images/hud/cursor2.png"
  },
  {
    type: "crosshair",
    name: "cursorClick",
    src: "client/images/hud/cursor2_click.png"
  }
];

var Img = loadImages(charSprites);
var MapImg = loadImages(mapSprites);
var HudImg = loadImages(hudSprites);

var testMap;
var bloodMap = [];

function getHexRGB(r,g,b){
  if(r > 255 || r < 0 || g > 255 || g < 0 || b > 255 || b < 0){
    return false;
  }
  let greenHex = g.toString(16);
  let redHex = r.toString(16);
  let blueHex = b.toString(16);
  if(greenHex.length === 1){
    greenHex = "0" + greenHex;
  }
  if(redHex.length === 1){
    redHex = "0" + redHex;
  }
  if(blueHex.length === 1){
    blueHex = "0" + blueHex;
  }
  return "#" + redHex + greenHex + blueHex;
}

function randomObject(obj){
  let result;
  let count = 0;
  for(let prop in obj){
    if(Math.random() < 1/++count){
      result = prop;
    }
  }
  return result;
}

function loadImages(spriteArray){
  loadedImages = {};
  for(let i = 0; i < spriteArray.length; i++){
    loadedImages[spriteArray[i].type] = loadedImages[spriteArray[i].type] || {};
    loadedImages[spriteArray[i].type][spriteArray[i].name] = new Image();
    loadedImages[spriteArray[i].type][spriteArray[i].name].src = spriteArray[i].src;
    loadedImages[spriteArray[i].type][spriteArray[i].name].onload = function(){
    this.isLoaded = true;
    }
  }
  return loadedImages;
}

function isLoaded(){
  if(loaded){
    return true;
  } else {
    for(let i in Img){
      for(let j in Img[i]){
        if(!Img[i][j].isLoaded){
          console.log('character sprite not loaded!');
          return false;
        }
      }
    }
    for(let i in MapImg){
      for(let j in MapImg[i]){
        if(!MapImg[i][j].isLoaded){
          console.log('map sprite not loaded!');
          return false;
        }
      }
    }
    loaded = true;
    return true;
  }
}

MapImg.grass.grass1.onload = function(){
  width = MapImg.grass.grass1.width;
  height = MapImg.grass.grass1.width*(0.639/1.083);
  imageHeight = MapImg.grass.grass1.height;
  loopHeight = Math.ceil(HEIGHT/height);
  loopWidth = Math.ceil(WIDTH/width);
  this.isLoaded = true;
};

var MapTile = function(x, y, width, height, sprite){
  let self = {};
  self.x = x;
  self.y = y;
  self.width = width;
  self.height = height;
  self.sprite = sprite;
  return self;
}

function buildTestMap(){
  let testMap = [];
  for(let i = 0; i < loopHeight; i++){
    for(let j = 0; j < loopWidth; j++){
      let sprite = MapImg["grass"][randomObject(MapImg["grass"])];
      let mapTile = MapTile(j*width - width/2, i*height - height/2, width, imageHeight, sprite);
      testMap.push(mapTile);
    }
    for(let k = 0; k < loopWidth; k++){
      let sprite = MapImg["grass"][randomObject(MapImg["grass"])];
      let mapTile = MapTile(k*width, i*height, width, imageHeight, sprite);
      testMap.push(mapTile);
    }
  }
  return testMap;
}

function drawTestMap(testMap){
  ctxbg.fillRect(-WIDTH/2,-HEIGHT/2,2*WIDTH,2*HEIGHT);
  for(let i in testMap){
    ctxbg.drawImage(testMap[i].sprite, testMap[i].x, testMap[i].y, testMap[i].width, testMap[i].height);
  }
  for(let i = bloodMap.length - 1; i >= 0; i--){
    ctxbg.drawImage(bloodMap[i].sprite, bloodMap[i].x - bloodMap[i].sprite.width/2, bloodMap[i].y - 20, bloodMap[i].sprite.width, bloodMap[i].sprite.height);
    if(Date.now() - bloodMap[i].initTime > BLOODDURATION){
      bloodMap.splice(i,1);
    }
  }
}

var Hud = function(){
  let self = {};
  self.canvas = ctxhud;

  self.drawHud = function(){
    self.canvas.clearRect(0,0,WIDTH,HEIGHT);
    self.drawHealth();
    self.drawMiniMap();
    self.drawFPS();
    self.drawCursor();
  }

  self.drawCursor = function(){
    // Draw cursor
    if(!mouseClicked) {
      self.canvas.drawImage(HudImg.crosshair.cursor,mouseX-16,mouseY-16,32,32);
    } else {
      self.canvas.drawImage(HudImg.crosshair.cursorClick,mouseX-16,mouseY-16,32,32);
    }
  }

  self.drawHealth = function(){
    //Draw clear + with black border
    self.canvas.fillStyle = "#000000";
    self.canvas.fillRect(hudHPMargin+((hudHPLength-hudHPWidth)/2), HEIGHT - hudHPLength - hudHPMargin, hudHPWidth, hudHPLength);
    self.canvas.fillRect(hudHPMargin, HEIGHT - hudHPMargin - (hudHPLength/2 + hudHPWidth/2), hudHPLength, hudHPWidth);
    self.canvas.clearRect(hudHPMargin+((hudHPLength-hudHPWidth)/2) + hudOutlineThickness, HEIGHT - hudHPLength - hudHPMargin + hudOutlineThickness, hudHPWidth - 2*hudOutlineThickness, hudHPLength - 2*hudOutlineThickness);
    self.canvas.clearRect(hudHPMargin + hudOutlineThickness, HEIGHT - hudHPMargin - (hudHPLength/2 + hudHPWidth/2) + hudOutlineThickness, hudHPLength - 2*hudOutlineThickness, hudHPWidth - 2*hudOutlineThickness);

    //Calculate how much of + to fill
    let playerHPPercent = Player.list[playerID].hp/Player.list[playerID].hpMax;
    let fillHeight = (hudHPLength - 2*hudOutlineThickness) - Math.floor((hudHPLength - 2*hudOutlineThickness) * playerHPPercent);
    let horFillHeight = fillHeight - (hudHPLength - hudHPWidth)/2;
    if(horFillHeight < 0){
      horFillHeight = 0;
    } else if(horFillHeight > (hudHPWidth - 2*hudOutlineThickness)){
      horFillHeight = hudHPWidth - 2*hudOutlineThickness;
    }

    //Generate fill colour based on health %
    let green = Math.floor(255 * playerHPPercent);
    let red = 255 - green;
    self.canvas.fillStyle = getHexRGB(red, green, 0);

    //Fill + with colour
    self.canvas.fillRect(hudHPMargin+((hudHPLength-hudHPWidth)/2) + hudOutlineThickness, HEIGHT - hudHPLength - hudHPMargin + hudOutlineThickness + fillHeight, hudHPWidth - 2*hudOutlineThickness, hudHPLength - 2*hudOutlineThickness - fillHeight);
    self.canvas.fillRect(hudHPMargin + hudOutlineThickness, HEIGHT - hudHPMargin - (hudHPLength/2 + hudHPWidth/2) + hudOutlineThickness + horFillHeight, hudHPLength - 2*hudOutlineThickness, hudHPWidth - 2*hudOutlineThickness - horFillHeight);

    //Print hp% in black over +

    self.canvas.fillStyle = "#FFFFFF";
    self.canvas.textAlign="center"
    self.fontSize = 16;
    self.canvas.font = "Bold " + self.fontSize + "pt Calibri";
    self.canvas.fillText(Math.ceil(playerHPPercent*100), hudHPLength/2 + hudHPMargin , HEIGHT - hudHPLength/2 - hudHPMargin + self.fontSize/2 - 1);
    self.canvas.lineWidth = 1;
    self.canvas.strokeStyle = '#000000';
    self.canvas.strokeText(Math.ceil(playerHPPercent*100),hudHPLength/2 + hudHPMargin , HEIGHT - hudHPLength/2 - hudHPMargin + self.fontSize/2 - 1);
  }

  self.drawMiniMap = function(){
    // does nothing atm
  }

  self.drawFPS = function(){
    if(fps >= frameRate){
      self.canvas.fillStyle = "#00FF00";
    } else if(fps >= frameRate*(.95)){
      self.canvas.fillStyle = "#FFFF00";
    } else {
      self.canvas.fillStyle = "#FF0000";
    }

    self.canvas.textAlign="center"
    self.fontSize = 12;
    self.canvas.font = "Bold " + self.fontSize + "pt Calibri";
    self.canvas.fillText(fps, WIDTH - hudHPMargin , hudHPMargin);
    self.canvas.lineWidth = 1;
    self.canvas.strokeStyle = '#000000';
    self.canvas.strokeText(fps,WIDTH - hudHPMargin , hudHPMargin);
  }

  return self;
}

function translateView(){
  xTrans = WIDTH/(2) - playerX*scale;
  yTrans = HEIGHT/(2) - playerY*scale;
  ctx.save();
  ctxbg.save();
  ctx.translate(xTrans,yTrans);
  ctxbg.translate(xTrans,yTrans);
}

let hpBarWidth = 30;

var Player = function(initPack){
  let self = {};
  self.id = initPack.id;
  self.number = initPack.number;
  self.name = initPack.name;
  self.direction = 0;
  self.interp = MININTERP;
  self.x = initPack.x;
  self.y = initPack.y;
  self.hp = initPack.hp;
  self.hpMax = initPack.hpMax;
  self.score = initPack.score;
  self.mouseAngle = initPack.mouseAngle;
  self.moveDelay = initPack.moveDelay;
  self.moveAmount = initPack.moveAmount;
  self.xOld = self.x;
  self.yOld = self.y;
  self.stateTime = Date.now();
  self.runState = 0;
  self.hpBarOffset = 0;

  self.draw = function(){
    let width = Img.player.width;
    let height = Img.player.height;

    let deltaX = self.x - self.xOld;
    let deltaY = self.y - self.yOld;

    let interpRate = 2.5*(200/self.moveDelay)

    if(deltaX > interpRate){
      self.xOld += interpRate;
    } else if (deltaX < -interpRate){
      self.xOld -= interpRate;
    } else {
      self.xOld = self.x;
    }

    if(deltaY > interpRate){
      self.yOld += interpRate;
    } else if (deltaY < -interpRate){
      self.yOld -= interpRate;
    } else {
      self.yOld = self.y;
    }

    if(self.interp < MAXINTERP){
      self.interp += 0.001;
    }


    self.setDirection();

    if(Math.abs(self.xOld - self.x) < 1){
      self.xOld = self.x;
    }
    if(Math.abs(self.yOld - self.y) < 1){
      self.yOld = self.y;
    }

    if(self.id === playerID){
      self.drawHPBar();
      self.hpBarOffset = 5;
    }

    self.drawPlayer(self.isMoving(), PLAYERSPRITEWIDTH, PLAYERSPRITEHEIGHT);

    self.drawName();
  }

  self.setDirection = function(){
    // down = 0, left = 1, right = 2, up = 3
    let deltaX = self.x - self.xOld;
    let deltaY = self.y - self.yOld;
    let isXLarger = Math.abs(deltaX) > Math.abs(deltaY);
    if(deltaX > 0 && isXLarger){
      self.direction = 2;
    } else if(deltaX < 0 && isXLarger) {
      self.direction = 1;
    } else if(deltaY > 0){
      self.direction = 0;
    } else if(deltaY < 0){
      self.direction = 3;
    } else {
      //reset Movement Interp
      self.interp = MININTERP;
    }
  }

  self.drawHPBar = function(){
    ctx.fillStyle = "#000000";
    ctx.fillRect(self.xOld - hpBarWidth/2,self.yOld - 32,30, 4);
    let hpWidth = hpBarWidth * self.hp/self.hpMax;
    if(self.hp === self.hpMax){
      ctx.fillStyle = "#0000FF";
    } else{
      let hpPercent = self.hp/self.hpMax;
      let green = parseInt(Math.floor(255 * hpPercent));
      let red = 255 - green;
      ctx.fillStyle = getHexRGB(red, green, 0);
    }
    ctx.fillRect(self.xOld - hpBarWidth/2,self.yOld - 32,hpWidth, 4);
    ctx.fillStyle = "#000000";
  }

  self.drawName = function(){
    ctx.textAlign="center"
    ctx.font = "8pt Arial Black";
    ctx.fillText(self.name, self.xOld, self.yOld - 30 - self.hpBarOffset);
  }

  self.isMoving = function(){
    if(self.xOld !== self.x || self.yOld !== self.y){
      return true;
    } else {
      return false;
    }
  }

  self.drawPlayer = function(isMoving, width, height){

    let index;
    if(isMoving){
      index = undefined;
    } else {
      index = 1;
    }
    if(self.runState === 0){
      ctx.drawImage(Img.player.playerFull, index*57 || 57*0, 57*self.direction, 57, 57, self.xOld-width/2, self.yOld-height/2, 57, 57);

      if(Date.now() - self.stateTime >= ANIMATIONTIME){
        self.runState = 1;
        self.stateTime = Date.now();
      }

    } else if(self.runState === 1) {
      ctx.drawImage(Img.player.playerFull, index*57 || 57*1, 57*self.direction, 57, 57, self.xOld-width/2, self.yOld-height/2, 57, 57);

      if(Date.now() - self.stateTime >= ANIMATIONTIME/2){
        self.runState = 2;
        self.stateTime = Date.now();
      }

    } else if(self.runState === 2) {
      ctx.drawImage(Img.player.playerFull, index*57 || 57*2, 57*self.direction, 57, 57, self.xOld-width/2, self.yOld-height/2, 57, 57);

      if(Date.now() - self.stateTime >= ANIMATIONTIME){
        self.runState = 0;
        self.stateTime = Date.now();
      }
    }
  }

  Player.list[self.id] = self;
  return self;
}
Player.list = {};

function rotateAndCache(image,angle) {
  let offscreenCanvas = document.createElement('canvas');
  let offscreenCtx = offscreenCanvas.getContext('2d');

  let size = Math.max(image.width, image.height);
  offscreenCanvas.width = size;
  offscreenCanvas.height = size;

  offscreenCtx.translate(size/2, size/2);
  offscreenCtx.rotate(angle + Math.PI/2);
  offscreenCtx.drawImage(image, -(image.width/2), -(image.height/2));

  return offscreenCanvas;
}

// Initialize the actual player
socket.on('initPlayer',function(data){
  playerName = data.name;
  playerX = data.x;
  playerY = data.y;
  playerID = data.id;
  testMap = buildTestMap();
  drawTestMap(testMap);
  hud = new Hud();
  loggedIn = true;
});

//init
socket.on('init', function(data){
  // { player:}w
  for(let i = 0; i < data.players.length; i++){
    new Player(data.players[i]);
  }
})

//updated
socket.on('update', function(data){
  for(let i = 0; i < data.players.length; i++){
    let pack = data.players[i];
    let p = Player.list[pack.id];
    if(p){
      if(pack.x !== undefined){
        p.x = pack.x;
      }
      if(pack.y !== undefined){
        p.y = pack.y;
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
    }
  }

});

//remove
socket.on('remove', function(data){
  for(let i = 0; i < data.players.length; i++){
    delete Player.list[data.players[i]];
  }
})

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
  if(!chatFocused){
    console.log(playerX, playerY);
    console.log(mouseX, mouseY);

    // figure out which tile was clicked
    var currentTileX = playerX / 64;
    var currentTileY = playerY / 64;

    // 640 and 364 magic numbers to be replaced by constants
    var distFromTargetInTilesX = Math.round((mouseX - 640) / 64);
    var distFromTargetInTilesY = Math.round((mouseY - 364) / 64);

    var targetTileX = currentTileX + distFromTargetInTilesX;
    var targetTileY = currentTileY + distFromTargetInTilesY;

    socket.emit('attack', {attackingPlayer: playerID, tileX: targetTileX, tileY: targetTileY})
    //socket.emit('keyPress', {inputId:'attack', state:true});
    mouseClicked = true;
  }
}

document.onmouseup = function(event){
  //socket.emit('keyPress', {inputId: 'attack', state:false});
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
  for(let i in Player.list){
    sortedList.push({
      key: i,
      y: Player.list[i].y
    });
  }
  sortedList.sort(function(a,b){
    return a.y - b.y;
  });
  return sortedList;
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
    playerX = Player.list[playerID].xOld;
    playerY = Player.list[playerID].yOld;
    // Update aim
    if(updateCount >= 50){
      updateAngle();
    }

    translateView();
    ctx.scale(scale,scale);
    ctxbg.scale(scale,scale);

    if(isPlayerMoving){
      drawTestMap(testMap);
      ctxbg.restore();
    }

    // Draw players and bullets
    ctx.clearRect(-WIDTH/2,-HEIGHT/2,2*WIDTH,2*HEIGHT);

    let sortedList = sortPlayersByY();

    // Draw players in order from top to bottom of screen
    for(let i in sortedList){
      Player.list[sortedList[i].key].draw();
    }
    ctxhud.clearRect(0,0,WIDTH,HEIGHT);
    hud.drawHud();

    ctx.restore();
    fpsCount++;
    if(Date.now() - fpsTimer >= 1000){
      let now = Date.now();
      fps = Math.floor(fpsCount/((now - fpsTimer)/1000));
      fpsCount = 0;
      fpsTimer = Date.now();
    }
  }

}, 1000/frameRate);
