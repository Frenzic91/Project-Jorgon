class Hud {
  constructor(ctxHud){
    this.canvas = ctxHud;
    // Hud details
  }

  drawHud(sortedList) {
    this.canvas.clearRect(0,0,WIDTH,HEIGHT);
    this.drawHealth();
    this.drawMiniMap();
    this.drawFPS();
    this.drawCursor();
    this.drawHealthBars(sortedList);
    this.drawPlayerNames(sortedList);
  }

  drawCursor() {
    // Draw cursor
    if(!mouseClicked) {
      this.canvas.drawImage(hudImg.crosshair.cursor,mouseX-16,mouseY-16,32,32);
    } else {
      this.canvas.drawImage(hudImg.crosshair.cursorClick,mouseX-16,mouseY-16,32,32);
    }
  }

  drawHealth() {
    //Draw clear + with black border
    this.canvas.fillStyle = "#000000";
    this.canvas.fillRect(hudHPMargin+((hudHPLength-hudHPWidth)/2), HEIGHT - hudHPLength - hudHPMargin, hudHPWidth, hudHPLength);
    this.canvas.fillRect(hudHPMargin, HEIGHT - hudHPMargin - (hudHPLength/2 + hudHPWidth/2), hudHPLength, hudHPWidth);
    this.canvas.clearRect(hudHPMargin+((hudHPLength-hudHPWidth)/2) + hudOutlineThickness, HEIGHT - hudHPLength - hudHPMargin + hudOutlineThickness, hudHPWidth - 2*hudOutlineThickness, hudHPLength - 2*hudOutlineThickness);
    this.canvas.clearRect(hudHPMargin + hudOutlineThickness, HEIGHT - hudHPMargin - (hudHPLength/2 + hudHPWidth/2) + hudOutlineThickness, hudHPLength - 2*hudOutlineThickness, hudHPWidth - 2*hudOutlineThickness);

    //Calculate how much of + to fill
    let playerHPPercent = playerList[playerID].hp/playerList[playerID].hpMax;
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
    this.canvas.fillStyle = getHexRGB(red, green, 0);

    //Fill + with colour
    this.canvas.fillRect(hudHPMargin+((hudHPLength-hudHPWidth)/2) + hudOutlineThickness, HEIGHT - hudHPLength - hudHPMargin + hudOutlineThickness + fillHeight, hudHPWidth - 2*hudOutlineThickness, hudHPLength - 2*hudOutlineThickness - fillHeight);
    this.canvas.fillRect(hudHPMargin + hudOutlineThickness, HEIGHT - hudHPMargin - (hudHPLength/2 + hudHPWidth/2) + hudOutlineThickness + horFillHeight, hudHPLength - 2*hudOutlineThickness, hudHPWidth - 2*hudOutlineThickness - horFillHeight);

    //Print hp% in black over +

    this.canvas.fillStyle = "#FFFFFF";
    this.canvas.textAlign="center"
    this.fontSize = 16;
    this.canvas.font = "Bold " + this.fontSize + "pt Calibri";
    this.canvas.fillText(Math.ceil(playerHPPercent*100), hudHPLength/2 + hudHPMargin , HEIGHT - hudHPLength/2 - hudHPMargin + this.fontSize/2 - 1);
    this.canvas.lineWidth = 1;
    this.canvas.strokeStyle = '#000000';
    this.canvas.strokeText(Math.ceil(playerHPPercent*100),hudHPLength/2 + hudHPMargin , HEIGHT - hudHPLength/2 - hudHPMargin + this.fontSize/2 - 1);
  }

  drawMiniMap() {
    // does nothing atm
  }

  drawFPS() {
    if(fps >= frameRate){
      this.canvas.fillStyle = "#00FF00";
    } else if(fps >= frameRate*(.95)){
      this.canvas.fillStyle = "#FFFF00";
    } else {
      this.canvas.fillStyle = "#FF0000";
    }

    this.canvas.textAlign="center"
    this.fontSize = 12;
    this.canvas.font = "Bold " + self.fontSize + "pt Calibri";
    this.canvas.fillText(fps, WIDTH - hudHPMargin , hudHPMargin);
    this.canvas.lineWidth = 1;
    this.canvas.strokeStyle = '#000000';
    this.canvas.strokeText(fps,WIDTH - hudHPMargin , hudHPMargin);
  }

  drawHealthBars(sortedList){
    for(let i in sortedList){
      playerList[sortedList[i].key].drawHPBar(this.canvas);
    }
  }

  drawPlayerNames(sortedList){
    for(let i in sortedList){
      playerList[sortedList[i].key].drawName(this.canvas);
    }
  }

}
