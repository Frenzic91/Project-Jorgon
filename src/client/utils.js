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
