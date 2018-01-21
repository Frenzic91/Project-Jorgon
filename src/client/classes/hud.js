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
    this.inventoryColumns = 10;
    this.itemTooltipSizeX = 200;
    this.itemTooltipSizeY = 250;
    this.itemDescriptionLineCharacterLimit = 30;
    // Hud details

    this.equipmentEnabled = false;
    this.equipmentX = this.inventoryX;
    this.equipmentY = this.inventoryY;
    this.equipmentWidth = 340;
    this.equipmentHeight = 340;
    this.equipmentOffset = 50;
    this.equipmentSlots = [];
    this.initEquipment();

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
      this.drawItemDescription(inventory.items[this.getInventorySlot(mouseX,mouseY)],this.inventoryX-this.itemTooltipSizeX,this.inventoryY);
    }

    if(this.equipmentEnabled){
      this.drawEquipment();
      this.drawItemDescription(equipment[this.getEquipmentSlot(mouseX,mouseY)],this.equipmentX-this.itemTooltipSizeX,this.equipmentY);
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
    // Background
    this.canvas.fillStyle = "#000000";
    this.canvas.fillRect(this.inventoryX, this.inventoryY, this.inventoryWidth, this.inventoryHeight);
    // Inventory text
    this.canvas.fillStyle = "#FFFFFF";
    this.canvas.font = "16px Calibri";
    this.canvas.textAlign = "start";
    this.canvas.fillText("INVENTORY", this.inventoryX + 10, this.inventoryY + 10 + 8);

    // Grid
    this.canvas.lineWidth = 1;
    this.canvas.strokeStyle = "#111111";
    this.canvas.beginPath();


    // Horizontal lines
    for(let i = 1; i < (this.inventoryColumns - 1); i++){
      this.canvas.moveTo(this.inventoryX + this.inventoryGridOffset, this.inventoryY + this.inventoryGridOffset + 18 + i*TILESIZE/2);
      this.canvas.lineTo(this.inventoryX + this.inventoryGridOffset + this.inventoryWidth - this.inventoryGridOffset*2, this.inventoryY + this.inventoryGridOffset + 18 + i*TILESIZE/2);
    }

    // Vertical lines
    for(let i = 1; i < this.inventoryColumns; i++){
      this.canvas.moveTo(this.inventoryX + this.inventoryGridOffset + i*TILESIZE/2, this.inventoryY + this.inventoryGridOffset + 18);
      this.canvas.lineTo(this.inventoryX + this.inventoryGridOffset + i*TILESIZE/2, this.inventoryY + this.inventoryGridOffset + 18 + this.inventoryHeight - 18 - this.inventoryGridOffset*2);
    }

    this.canvas.stroke();

    // Border
    this.canvas.beginPath();
    this.canvas.lineWidth = 2;
    this.canvas.strokeStyle = "#666666";
    this.canvas.rect(this.inventoryX + this.inventoryGridOffset, this.inventoryY + this.inventoryGridOffset + 18, this.inventoryWidth - this.inventoryGridOffset*2, this.inventoryHeight - 18 - this.inventoryGridOffset*2);
    this.canvas.stroke();




    this.canvas.globalAlpha = 1;

    this.drawInventoryItems();
  }

  drawInventoryItems(){
    for(let i = 0; i < inventory.items.length; i++){
      if(inventory.items[i]){
        let drawPosition = this.getInventorySlotXY(i);
          this.canvas.drawImage(getImageByIndex(itemImg["item"][inventory.items[i].id],0),this.inventoryX + drawPosition.x*TILESIZE/2 + this.inventoryGridOffset, this.inventoryY + drawPosition.y*TILESIZE/2 + this.inventoryGridOffset + 18, TILESIZE/2, TILESIZE/2);

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
      let column = Math.floor((mouseX - this.inventoryX - this.inventoryGridOffset)/(TILESIZE/2));
      let row = Math.floor((mouseY - this.inventoryY - this.inventoryGridOffset - 18)/(TILESIZE/2));
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

  // drawItemDescription(item,x,y){
  //   if(item !== undefined){
  //     if(inventory.items[slot]){
  //       // top left corner of the description box
  //       let descriptionX = this.inventoryX - this.itemTooltipSizeX;
  //       let descriptionY = this.inventoryY;
  //       // the margin for the image
  //       let descriptionImageOffset = 10;
  //       this.canvas.globalAlpha = 0.7;
  //       // background
  //       this.canvas.fillStyle = "#000000";
  //       this.canvas.fillRect(descriptionX, descriptionY, this.itemTooltipSizeX, this.itemTooltipSizeY);
  //       // image border
  //       this.canvas.beginPath();
  //       this.canvas.lineWidth = 1;
  //       this.canvas.strokeStyle = "#CCCCCC";
  //       this.canvas.rect(descriptionX + descriptionImageOffset, descriptionY + descriptionImageOffset, TILESIZE, TILESIZE);
  //       this.canvas.stroke();
  //
  //       // ID, ATK, DEF
  //       this.canvas.fillStyle = "#FFFFFF";
  //       this.canvas.font = "14px Calibri";
  //       this.canvas.textAlign = "start";
  //
  //       this.canvas.fillText("ID: " + inventory.items[slot].id,descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + descriptionImageOffset + 8);
  //       if(inventory.items[slot].atk)
  //       this.canvas.fillText("ATK: " + inventory.items[slot].atk,descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + 3*descriptionImageOffset + 8);
  //       if(inventory.items[slot].def)
  //       this.canvas.fillText("DEF: " + inventory.items[slot].def,descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + 5*descriptionImageOffset + 8);
  //
  //       // Item name
  //       this.canvas.fillText(inventory.items[slot].name,descriptionX + descriptionImageOffset, descriptionY + 2*descriptionImageOffset + 7 + TILESIZE);
  //
  //       // Description - with wordwrap
  //       //let description = "Phasellus ut sapien non purus interdum euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce varius lacus mattis ornare tristique. Duis molestie pellentesque augue, sagittis hendrerit velit egestas vitae. Phasellus ut sapien non purus interdum euismod.";
  //       let description = inventory.items[slot].description
  //       let splitDescription = description.split(" ");
  //       let line = "";
  //       let lineCount = 0;
  //
  //       for(let i = 0; i < splitDescription.length; i++){
  //         // If the next word does not make the line go over the character limit, append it
  //         if(line.length + splitDescription[i].length < this.itemDescriptionLineCharacterLimit){
  //           line += " " + splitDescription[i];
  //         } else { // Otherwise, print the line
  //           this.canvas.fillText(line,
  //                               descriptionX + descriptionImageOffset,
  //                               descriptionY + 4*descriptionImageOffset + 2*lineCount*descriptionImageOffset + 7 + TILESIZE,
  //                               this.itemTooltipSizeX - 2*descriptionImageOffset);
  //           lineCount++;
  //           // Start the next line with the current word
  //           line = splitDescription[i];
  //         }
  //         // On the last loop iteration, print what is left in line, if anything
  //         if(i === (splitDescription.length - 1) && line.length > 0){
  //           this.canvas.fillText(line,
  //                               descriptionX + descriptionImageOffset,
  //                               descriptionY + 4*descriptionImageOffset + 2*lineCount*descriptionImageOffset + 7 + TILESIZE,
  //                               this.itemTooltipSizeX - 2*descriptionImageOffset);
  //           lineCount++;
  //         }
  //       }
  //
  //       // Scale the tooltip height based on the description length
  //       this.itemTooltipSizeY = 4*descriptionImageOffset + TILESIZE + 2*lineCount*descriptionImageOffset;
  //
  //       this.canvas.globalAlpha = 1;
  //
  //       this.canvas.drawImage(getImageByIndex(itemImg["item"][inventory.items[slot].id],0),descriptionX + descriptionImageOffset, descriptionY + descriptionImageOffset);
  //     }
  //   }
  // }

  drawItemDescription(item,x,y){
    if(item !== undefined){
      // top left corner of the description box
      let descriptionX = x;
      let descriptionY = y;
      // the margin for the image
      let descriptionImageOffset = 10;
      this.canvas.globalAlpha = 0.7;
      // background
      this.canvas.fillStyle = "#000000";
      this.canvas.fillRect(descriptionX, descriptionY, this.itemTooltipSizeX, this.itemTooltipSizeY);
      // image border
      this.canvas.beginPath();
      this.canvas.lineWidth = 1;
      this.canvas.strokeStyle = "#CCCCCC";
      this.canvas.rect(descriptionX + descriptionImageOffset, descriptionY + descriptionImageOffset, TILESIZE, TILESIZE);
      this.canvas.stroke();

      // ID, ATK, DEF
      this.canvas.fillStyle = "#FFFFFF";
      this.canvas.font = "14px Calibri";
      this.canvas.textAlign = "start";

      this.canvas.fillText("ID: " + item.id,descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + descriptionImageOffset + 8);
      if(item.atk)
      this.canvas.fillText("ATK: " + item.atk,descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + 3*descriptionImageOffset + 8);
      if(item.def)
      this.canvas.fillText("DEF: " + item.def,descriptionX + 2*descriptionImageOffset + TILESIZE, descriptionY + 5*descriptionImageOffset + 8);

      // Item name
      this.canvas.fillText(item.name,descriptionX + descriptionImageOffset, descriptionY + 2*descriptionImageOffset + 7 + TILESIZE);

      // Description - with wordwrap
      //let description = "Phasellus ut sapien non purus interdum euismod. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce varius lacus mattis ornare tristique. Duis molestie pellentesque augue, sagittis hendrerit velit egestas vitae. Phasellus ut sapien non purus interdum euismod.";
      let description = item.description
      let splitDescription = description.split(" ");
      let line = "";
      let lineCount = 0;

      for(let i = 0; i < splitDescription.length; i++){
        // If the next word does not make the line go over the character limit, append it
        if(line.length + splitDescription[i].length < this.itemDescriptionLineCharacterLimit){
          line += " " + splitDescription[i];
        } else { // Otherwise, print the line
          this.canvas.fillText(line,
                              descriptionX + descriptionImageOffset,
                              descriptionY + 4*descriptionImageOffset + 2*lineCount*descriptionImageOffset + 7 + TILESIZE,
                              this.itemTooltipSizeX - 2*descriptionImageOffset);
          lineCount++;
          // Start the next line with the current word
          line = splitDescription[i];
        }
        // On the last loop iteration, print what is left in line, if anything
        if(i === (splitDescription.length - 1) && line.length > 0){
          this.canvas.fillText(line,
                              descriptionX + descriptionImageOffset,
                              descriptionY + 4*descriptionImageOffset + 2*lineCount*descriptionImageOffset + 7 + TILESIZE,
                              this.itemTooltipSizeX - 2*descriptionImageOffset);
          lineCount++;
        }
      }

      // Scale the tooltip height based on the description length
      this.itemTooltipSizeY = 4*descriptionImageOffset + TILESIZE + 2*lineCount*descriptionImageOffset;

      this.canvas.globalAlpha = 1;

      this.canvas.drawImage(getImageByIndex(itemImg["item"][item.id],0),descriptionX + descriptionImageOffset, descriptionY + descriptionImageOffset);
    }
  }

  initEquipment(){
    // Helmet
    let helmetSlot = {
      x: this.inventoryX + this.equipmentWidth/2,
      y: this.equipmentY + 72,
      type: "helmet"
    };
    this.equipmentSlots.push(helmetSlot);

    // Chest
    let chestSlot = {
      x: this.inventoryX + this.equipmentWidth/2,
      y: this.equipmentY + 120,
      type: "chest"
    };
    this.equipmentSlots.push(chestSlot);

    // Legs
    let legsSlot = {
      x: this.inventoryX + this.equipmentWidth/2,
      y: this.equipmentY + 195,
      type: "legs"
    };
    this.equipmentSlots.push(legsSlot);

    // Boots
    let bootsSlot = {
      x: this.inventoryX + this.equipmentWidth/2,
      y: this.equipmentY + 310,
      type: "boots"
    };
    this.equipmentSlots.push(bootsSlot);

    // Gloves
    let glovesSlot = {
      x: this.inventoryX + 227,
      y: this.equipmentY + 155,
      type: "gloves"
    };
    this.equipmentSlots.push(glovesSlot);

    // Shoulders
    let shouldersSlot = {
      x: this.inventoryX + 132,
      y: this.equipmentY + 105,
      type: "shoulders"
    };
    this.equipmentSlots.push(shouldersSlot);

    // Weapon - Left Hand
    let weapon = {
      x: this.inventoryX + 110,
      y: this.equipmentY + 200,
      type: "weapon"
    };
    this.equipmentSlots.push(weapon);

    // offHand - Right Hand
    let offHand = {
      x: this.inventoryX + 230,
      y: this.equipmentY + 200,
      type: "offHand"
    };
    this.equipmentSlots.push(offHand);
  }

  toggleEquipment(){
    this.equipmentEnabled = !this.equipmentEnabled;
    if(this.equipmentEnabled){
      this.inventoryY += this.equipmentHeight;
    } else {
      this.inventoryY -= this.equipmentHeight;
    }
  }

  isMouseOverEquipment(mouseX, mouseY) {
    if(this.equipmentEnabled) {
      if(mouseX > (this.equipmentX) &&
        mouseX < (this.equipmentX + this.equipmentWidth) &&
        mouseY > (this.equipmentY) &&
        mouseY < (this.equipmentY + this.equipmentHeight)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getEquipmentSlot(mouseX, mouseY){
    if(this.isMouseOverEquipment(mouseX,mouseY)){
      for(let i = 0; i < this.equipmentSlots.length; i++){
        if(isCoordInSquare(mouseX, mouseY, this.equipmentSlots[i].x - TILESIZE/4, this.equipmentSlots[i].y - TILESIZE/4, TILESIZE/2, TILESIZE/2)){
          return this.equipmentSlots[i].type;
        }
      }
      return undefined;
    }
    else {
      return undefined;
    }
  }

  drawEquipment(){
    this.canvas.globalAlpha = 0.7;
    this.equipmentY = this.inventoryY - this.equipmentHeight;
    // Background
    this.canvas.fillStyle = "#000000";
    this.canvas.fillRect(this.inventoryX, this.equipmentY, this.equipmentWidth, this.equipmentHeight);
    this.canvas.drawImage(getImageByIndex(hudImg["interface"]["equipmentbackground"],0), this.inventoryX, this.equipmentY);
    // Equipment text
    this.canvas.fillStyle = "#FFFFFF";
    this.canvas.font = "16px Calibri";
    this.canvas.textAlign = "start";
    this.canvas.fillText("EQUIPMENT", this.inventoryX + 10, this.equipmentY + 10 + 8);

    this.canvas.font = "14px Calibri";
    this.canvas.fillText("ATK: "+atk, this.inventoryX + 15, this.equipmentY + 50);
    this.canvas.fillText("DEF: "+def, this.inventoryX + 15, this.equipmentY + 70);

    // Equipment slots
    this.canvas.beginPath();
    this.canvas.lineWidth = 1;
    this.canvas.strokeStyle = "#EEEEEE";

    for(let i = 0; i < this.equipmentSlots.length; i++){
      this.canvas.rect(this.equipmentSlots[i].x - TILESIZE/4, this.equipmentSlots[i].y - TILESIZE/4, TILESIZE/2, TILESIZE/2);
    }


    this.canvas.stroke();
    this.canvas.globalAlpha = 1;

    this.drawEquipmentItems();
  }

  drawEquipmentItems(){
    for(let i = 0; i < this.equipmentSlots.length; i++){
      let item = equipment[this.equipmentSlots[i].type]
      if(item){
        let drawPosition = {
          x: this.equipmentSlots[i].x - TILESIZE/4,
          y: this.equipmentSlots[i].y - TILESIZE/4
        }
          this.canvas.drawImage(getImageByIndex(itemImg["item"][item.id],0),drawPosition.x, drawPosition.y, TILESIZE/2, TILESIZE/2);
      }
    }
  }

}
