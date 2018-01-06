class Player {
  constructor(initPack){
  this.id = initPack.id;
  this.number = initPack.number;
  this.name = initPack.name;
  this.direction = 0;
  this.interp = MININTERP;
  this.x = initPack.x;
  this.y = initPack.y;
  this.screenX = initPack.x * TILESIZE;
  this.screenY = initPack.y * TILESIZE;
  this.hp = initPack.hp;
  this.hpMax = initPack.hpMax;
  this.score = initPack.score;
  this.mouseAngle = initPack.mouseAngle;
  this.moveDelay = initPack.moveDelay;
  this.moveAmount = initPack.moveAmount;
  this.xOld = this.screenX;
  this.yOld = this.screenY;
  this.stateTime = Date.now();
  this.spellStateTime = Date.now(); // temp
  this.runState = 0;
  this.spellState = 0; // temp
  this.isCastingSpell = false;
  this.hpBarOffset = 5;
  }

  draw() {
    let width = playerImg.player.width;
    let height = playerImg.player.height;

    let deltaX = this.screenX - this.xOld;
    let deltaY = this.screenY - this.yOld;



    //let interpRate = 5*(200/this.moveDelay)*((frameRate)/fps);

    let maxMovementTiles = 1000/this.moveDelay;
    let maxMovementPixels = maxMovementTiles * TILESIZE;
    let interpRate = maxMovementPixels/fps;



    if(deltaX > interpRate){
      this.xOld += interpRate;
    } else if (deltaX < -interpRate){
      this.xOld -= interpRate;
    } else {
      this.xOld = this.screenX;
    }

    if(deltaY > interpRate){
      this.yOld += interpRate;
    } else if (deltaY < -interpRate){
      this.yOld -= interpRate;
    } else {
      this.yOld = this.screenY;
    }

    this.setDirection();

    this.drawPlayer(this.isMoving(), PLAYERSPRITEWIDTH, PLAYERSPRITEHEIGHT);

  }

  setDirection() {
    // down = 0, left = 1, right = 2, up = 3
    let deltaX = this.screenX - this.xOld;
    let deltaY = this.screenY - this.yOld;
    let isXLarger = Math.abs(deltaX) > Math.abs(deltaY);
    if(deltaX > 0 && isXLarger){
      this.direction = 2;
    } else if(deltaX < 0 && isXLarger) {
      this.direction = 1;
    } else if(deltaY > 0){
      this.direction = 0;
    } else if(deltaY < 0){
      this.direction = 3;
    } else {
      //reset Movement Interp
      this.interp = MININTERP;
    }
  }

  drawHPBar(ctxHUD) {
    //let finalX = this.xOld - offsetX;
    let finalX = (this.xOld - playerXPixels)*scale + WIDTH/2; // Accounts for zoom scale -- global variable
    let finalY = (this.yOld - playerYPixels)*scale + HEIGHT/2; // Accounts for zoom scale -- global variable

    ctxHUD.fillStyle = "#000000";
    ctxHUD.fillRect(finalX - hpBarWidth*scale/2,finalY - 32*scale,hpBarWidth*scale, 4*scale);
    let hpWidth = hpBarWidth * this.hp/this.hpMax;

    let hpPercent = this.hp/this.hpMax;
    let green = parseInt(Math.floor(255 * hpPercent));
    let red = 255 - green;
    ctxHUD.fillStyle = getHexRGB(red, green, 0);

    ctxHUD.fillRect(finalX - hpBarWidth*scale/2,finalY - 32*scale,hpWidth*scale, 4*scale);
    ctxHUD.fillStyle = "#000000";
  }

  drawName(ctxHUD) {
    // Replaced ctxEntities with ctxHUD
    let offsetX = playerXPixels - WIDTH/2;
    let offsetY = playerYPixels - HEIGHT/2;
    let fontSizeBase = 8;
    // let finalX = this.xOld - offsetX;
    // let finalY = this.yOld - offsetY;
    let finalX = (this.xOld - playerXPixels)*scale + WIDTH/2; // Accounts for zoom scale -- global variable
    let finalY = (this.yOld - playerYPixels)*scale + HEIGHT/2; // Accounts for zoom scale -- global variable
    // Show the player's name in red if he is the attack target
    if(playerList[playerID].attackTarget == this.id){
      ctxHUD.fillStyle = 'red';
    } else {
      ctxHUD.fillStyle = 'black';
    }
    ctxHUD.textAlign="center"
    ctxHUD.font = Math.ceil(fontSizeBase*scale)+"pt Arial Black";
    ctxHUD.fillText(this.name, finalX, finalY - 30*scale - this.hpBarOffset*scale);
  }

  isMoving() {
    if(this.xOld !== this.screenX || this.yOld !== this.screenY){
      return true;
    } else {
      return false;
    }
  }

  drawPlayer(isMoving, width, height) {
    let index;
    if(isMoving){
      index = undefined;
    } else {
      index = 1;
    }

    if(this.runState === 0){
      ctxEntities.drawImage(playerImg.player.playerFull, index*57 || 57*0, 57*this.direction, 57, 57, this.xOld-width/2, this.yOld-height/2, 57, 57);

      if(Date.now() - this.stateTime >= ANIMATIONTIME){
        this.runState = 1;
        this.stateTime = Date.now();
      }

    } else if(this.runState === 1) {
      ctxEntities.drawImage(playerImg.player.playerFull, index*57 || 57*1, 57*this.direction, 57, 57, this.xOld-width/2, this.yOld-height/2, 57, 57);

      if(Date.now() - this.stateTime >= ANIMATIONTIME/2){
        this.runState = 2;
        this.stateTime = Date.now();
      }

    } else if(this.runState === 2) {
      ctxEntities.drawImage(playerImg.player.playerFull, index*57 || 57*2, 57*this.direction, 57, 57, this.xOld-width/2, this.yOld-height/2, 57, 57);

      if(Date.now() - this.stateTime >= ANIMATIONTIME){
        this.runState = 0;
        this.stateTime = Date.now();
      }
    }

  }

  drawOccludedPlayer(){
    // If player is occluded, draw with 20% opacity
    if(map.hasOcclusion(this.x,this.y)){
      ctxEntities.globalAlpha = 0.1;
      this.drawPlayer(this.isMoving(),PLAYERSPRITEWIDTH, PLAYERSPRITEHEIGHT);
      // Reset opacity
      ctxEntities.globalAlpha = 1;
    }
  }

  // temp
  drawSpellEffectOnPlayer() {
    if(this.spellState === 0){
      ctxEntities.drawImage(spellEffectImg.effect.healeffect, 64 * 0, 0, 64, 64, this.xOld-width/2-32, this.yOld-height/2-32, 64, 64);

      if(Date.now() - this.spellStateTime >= ANIMATIONTIME/1.5){
        this.spellState = 1;
        this.spellStateTime = Date.now();
      }

    } else if(this.spellState === 1){
      ctxEntities.drawImage(spellEffectImg.effect.healeffect, 64 * 0, 0, 64, 64, this.xOld-width/2-32, this.yOld-height/2-32, 64, 64);

      if(Date.now() - this.spellStateTime >= ANIMATIONTIME/1.5){
        this.spellState = 2;
        this.spellStateTime = Date.now();
      }

    } else if(this.spellState === 2) {
      ctxEntities.drawImage(spellEffectImg.effect.healeffect, 64 * 1, 0, 64, 64, this.xOld-width/2-32, this.yOld-height/2-32, 64, 64);

      if(Date.now() - this.spellStateTime >= ANIMATIONTIME/1.5){
        this.spellState = 3;
        this.spellStateTime = Date.now();
      }

    } else if(this.spellState === 3) {
      ctxEntities.drawImage(spellEffectImg.effect.healeffect, 64 * 2, 0, 64, 64, this.xOld-width/2-32, this.yOld-height/2-32, 64, 64);

      if(Date.now() - this.spellStateTime >= ANIMATIONTIME/1.5){
        this.spellState = 0;
        this.spellStateTime = Date.now();
        this.isCastingSpell = false;
      }
    }
  }


}
