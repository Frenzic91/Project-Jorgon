var mapSprites = [
  {
    type: "tile",
    name: "horizons_1_1",
    src: "client/images/horizons_1_1.png"
  },
  {
    type: "entities",
    name: "horizons_3_3",
    src: "client/images/horizons_3_3.png"
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

var Img = loadImages(charSprites);
var HudImg = loadImages(hudSprites);
var MapImg = loadImages(mapSprites);

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
