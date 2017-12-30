class Hud {
  constructor(ctxHud){
    this.canvas = ctxHud;
    this.inventoryEnabled = false;
    this.inventoryWidth = 340;
    this.inventoryHeight = 294;
    this.inventoryOffset = 50;
    this.inventoryGridOffset = 10;
    this.inventoryX = WIDTH-this.inventoryWidth-this.inventoryOffset;
    this.inventoryY = this.inventoryOffset;
    this.inventoryColumns = 5;
    this.itemDescriptionSizeX = 200;
    this.itemDescriptionSizeY = 250;
    // Hud details
  }

  drawHud(sortedList) {
    this.canvas.clearRect(0,0,WIDTH,HEIGHT);
    this.drawHealth();
    this.drawMiniMap();
    this.drawFPS();
    //this.drawCursor();
    this.drawHealthBars(sortedList);
    this.drawPlayerNames(sortedList);
    if(this.inventoryEnabled){
      this.drawInventory();
      this.drawItemDescription();
    }
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

  toggleInventory(){
    this.inventoryEnabled = !this.inventoryEnabled;
  }

  drawInventory(){

    this.canvas.globalAlpha = 0.7;
    this.canvas.fillStyle = "#000000";
    this.canvas.fillRect(this.inventoryX, this.inventoryY, this.inventoryWidth, this.inventoryHeight);
    this.canvas.fillStyle = "#FFFFFF";
    this.canvas.font = "16px Calibri";
    this.canvas.textAlign = "start";
    this.canvas.fillText("INVENTORY", this.inventoryX + 10, this.inventoryY + 10 + 8);

    this.canvas.lineWidth = 2;
    this.canvas.strokeStyle = "#EEEEEE";
    this.canvas.rect(this.inventoryX + this.inventoryGridOffset, this.inventoryY + this.inventoryGridOffset + 18, this.inventoryWidth - this.inventoryGridOffset*2, this.inventoryHeight - 18 - this.inventoryGridOffset*2);
    this.canvas.stroke();
    this.canvas.lineWidth = 1;
    this.canvas.strokeStyle = "#111111";
    this.canvas.beginPath();



    for(let i = 1; i < 4; i++){
      this.canvas.moveTo(this.inventoryX + this.inventoryGridOffset, this.inventoryY + this.inventoryGridOffset + 18 + i*TILESIZE);
      this.canvas.lineTo(this.inventoryX + this.inventoryGridOffset + this.inventoryWidth - this.inventoryGridOffset*2, this.inventoryY + this.inventoryGridOffset + 18 + i*TILESIZE);
    }

    for(let i = 1; i < 5; i++){
      this.canvas.moveTo(this.inventoryX + this.inventoryGridOffset + i*TILESIZE, this.inventoryY + this.inventoryGridOffset + 18);
      this.canvas.lineTo(this.inventoryX + this.inventoryGridOffset + i*TILESIZE, this.inventoryY + this.inventoryGridOffset + 18 + this.inventoryHeight - 18 - this.inventoryGridOffset*2);
    }

    this.canvas.stroke();



    this.canvas.globalAlpha = 1;

    this.drawInventoryItems();
  }

  drawInventoryItems(){
    for(let i = 0; i < inventory.items.length; i++){
      if(inventory.items[i]){
        let drawPosition = this.getInventorySlotXY(i);
        this.canvas.drawImage(itemImg.item.temp,this.inventoryX + drawPosition.x*TILESIZE + this.inventoryGridOffset, this.inventoryY + drawPosition.y*TILESIZE + this.inventoryGridOffset + 18);
      }
    }
  }

  isMouseOverInventory(mouseX, mouseY) {
    if(this.inventoryEnabled) {
      if(mouseX > (this.inventoryX + this.inventoryGridOffset) &&
        mouseX < (this.inventoryX + this.inventoryWidth - this.inventoryGridOffset) &&
        mouseY > (this.inventoryY + this.inventoryGridOffset + 18) &&
        mouseY < (this.inventoryY + this.inventoryHeight - this.inventoryGridOffset)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getInventorySlot(mouseX, mouseY){
    if(this.isMouseOverInventory(mouseX,mouseY)){
      let column = Math.floor((mouseX - this.inventoryX - this.inventoryGridOffset)/TILESIZE);
      let row = Math.floor((mouseY - this.inventoryY - this.inventoryGridOffset - 18)/TILESIZE);
      return row*this.inventoryColumns + column;
    }
    else {
      return undefined;
    }
  }

  getInventorySlotXY(index){
    let y = Math.floor(index/this.inventoryColumns);
    let x = (index - y*this.inventoryColumns);
    return {
      x: x,
      y: y
    };
  }

  drawItemDescription(){
    let slot = this.getInventorySlot(mouseX,mouseY);
    if(slot !== undefined){
      if(inventory.items[slot]){
        let descriptionX = this.inventoryX - this.itemDescriptionSizeX;
        let descriptionY = this.inventoryY;
        let descriptionImageOffset = 10;
        this.canvas.globalAlpha = 0.7;
        this.canvas.fillStyle = "#000000";
        this.canvas.fillRect(descriptionX, descriptionY, this.itemDescriptionSizeX, this.itemDescriptionSizeY);
        this.canvas.lineWidth = 1;
        this.canvas.strokeStyle = "#CCCCCC";
        this.canvas.rect(descriptionX + descriptionImageOffset, descriptionY + descriptionImageOffset, TILESIZE, TILESIZE);
        this.canvas.stroke();
        this.canvas.fillStyle = "#FFFFFF";
        this.canvas.font = "14px Calibri";
        this.canvas.textAlign = "start";

        this.canvas.fillText("ID: " + inventory.items[slot],descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + descriptionImageOffset + 8);
        this.canvas.fillText("ATK: " + inventory.items[slot],descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + 3*descriptionImageOffset + 8);
        this.canvas.fillText("DEF: " + inventory.items[slot],descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + 5*descriptionImageOffset + 8);

        this.canvas.fillText("ITEM NAME",descriptionX + descriptionImageOffset, descriptionY + 2*descriptionImageOffset + 7 + TILESIZE);
        let description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce varius lacus mattis ornare tristique. Duis molestie pellentesque augue, sagittis hendrerit velit egestas vitae. Phasellus ut sapien non purus interdum euismod.";
        let splitDescription = description.split(" ");
        let line = "";
        let lineCount = 0;
        let lineCharacterLimit = 35;
        for(let i = 0; i < splitDescription.length; i++){
          if(line.length + splitDescription[i].length < lineCharacterLimit){
            line += " " + splitDescription[i];
          } else {
            this.canvas.fillText(line,
                                descriptionX + descriptionImageOffset,
                                descriptionY + 4*descriptionImageOffset + 2*lineCount*descriptionImageOffset + 7 + TILESIZE,
                                this.itemDescriptionSizeX - 2*descriptionImageOffset);
            lineCount++;
            line = splitDescription[i];
          }
          if(i === (splitDescription.length - 1) && line.length > 0){
            this.canvas.fillText(line,
                                descriptionX + descriptionImageOffset,
                                descriptionY + 4*descriptionImageOffset + 2*lineCount*descriptionImageOffset + 7 + TILESIZE,
                                this.itemDescriptionSizeX - 2*descriptionImageOffset);
          }
        }


        this.canvas.globalAlpha = 1;
        this.canvas.drawImage(itemImg.item.temp,descriptionX + descriptionImageOffset, descriptionY + descriptionImageOffset);
      }
    }
  }

}
