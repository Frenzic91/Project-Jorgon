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

function getIndexFromCoords(x,y){
  return y * map.width + x;
}

function isCoordInSquare(mX, mY, x, y, dx, dy){
  if( mX >= x && mX <= (x + dx)
      && mY >= y && mY <= (y + dy) ) {
    return true;
  } else {
    return false;
  }
}
