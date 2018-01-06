var mapSprites = [
  {
    type: "tile",
    name: "horizons_1_1",
    width: TILESIZE,
    height: TILESIZE,
    src: "client/images/horizons_1_1.png"
  },
  {
    type: "entities",
    name: "horizons_4_4",
    width: TILESIZE*4,
    height: TILESIZE*4,
    src: "client/images/horizons_4_4.png"
  }
];

var charSprites = [
  {
    type: "player",
    name: "playerFull",
    src: "client/images/player_full_57.png"
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

var itemSprites = [
  {
    type: "item",
    name: "temp",
    src: "client/images/tempItem.png"
  },
  {
    type: "item",
    name: "temp2",
    src: "client/images/tempItem2.png"
  },
  {
    type: "item",
    name: "rune",
    src: "client/images/rune.png"
  }
];

var spellEffectSprites = [
  {
    type: "effect",
    name: "healeffect",
    src: "client/images/healeffect.png",
    details: {
      animationDuration: 200,
      offsetX: TILESIZE/2,
      offsetY: TILESIZE/2,
      frameCount: 3
    }
  }
];

var playerImg = loadImages(charSprites);
var hudImg = loadImages(hudSprites);
var mapImg = loadImages(mapSprites);
var itemImg = loadImages(itemSprites);
var spellEffectImg = loadImages(spellEffectSprites);

function loadImages(spriteArray){
  loadedImages = {};
  for(let i = 0; i < spriteArray.length; i++){
    loadedImages[spriteArray[i].type] = loadedImages[spriteArray[i].type] || {};
    loadedImages[spriteArray[i].type][spriteArray[i].name] = new Image();
    loadedImages[spriteArray[i].type][spriteArray[i].name].src = spriteArray[i].src;
    loadedImages[spriteArray[i].type][spriteArray[i].name].spriteHeight = spriteArray[i].height || 64;
    loadedImages[spriteArray[i].type][spriteArray[i].name].spriteWidth = spriteArray[i].width || 64;
    loadedImages[spriteArray[i].type][spriteArray[i].name].details = spriteArray[i].details || undefined;
    loadedImages[spriteArray[i].type][spriteArray[i].name].onload = function(){
      this.isLoaded = true;
    }
  }
  return loadedImages;
}

function getImageByIndex(image,index){
  let offscreenCanvas = document.createElement('canvas');
  let offscreenContext = offscreenCanvas.getContext('2d');
  let spriteSheetWidth = image.width;
  let column = index % spriteSheetWidth;
  let row = index / spriteSheetWidth;

  let spriteWidth = image.spriteWidth;
  let spriteHeight = image.spriteHeight;


  offscreenContext.drawImage(image, // Sprite sheet image
                            column*spriteWidth, // Sprite sheet index X
                            row*spriteHeight, // Sprite sheet index Y
                            spriteWidth,
                            spriteHeight,
                            0, // draw the sprite on the virtual canvas at X = 0
                            0, // draw the sprite on the virtual canvas at Y = 0
                            spriteWidth,
                            spriteHeight);

  return offscreenCanvas;
}
