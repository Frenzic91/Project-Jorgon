class Player {
  constructor(initPack){
  this.id = initPack.id;
  this.number = initPack.number;
  this.name = initPack.name;
  this.direction = 0;
  this.interp = MININTERP;
  this.x = initPack.x;
  this.y = initPack.y;
  this.hp = initPack.hp;
  this.hpMax = initPack.hpMax;
  this.score = initPack.score;
  this.mouseAngle = initPack.mouseAngle;
  this.moveDelay = initPack.moveDelay;
  this.moveAmount = initPack.moveAmount;
  this.xOld = initPack.x;
  this.yOld = initPack.y;
  this.stateTime = Date.now();
  this.runState = 0;
  this.hpBarOffset = 0;
  }

  draw() {
    let width = Img.player.width;
    let height = Img.player.height;

    let deltaX = this.x - this.xOld;
    let deltaY = this.y - this.yOld;

    let interpRate = 2.5*(200/this.moveDelay)

    if(deltaX > interpRate){
      this.xOld += interpRate;
    } else if (deltaX < -interpRate){
      this.xOld -= interpRate;
    } else {
      this.xOld = this.x;
    }

    if(deltaY > interpRate){
      this.yOld += interpRate;
    } else if (deltaY < -interpRate){
      this.yOld -= interpRate;
    } else {
      this.yOld = this.y;
    }

    //Does nothing atm - This was another form of interp
    // if(this.interp < MAXINTERP){
    //   this.interp += 0.001;
    // }

    this.setDirection();

    if(Math.abs(this.xOld - this.x) < 1){
      this.xOld = this.x;
    }
    if(Math.abs(this.yOld - this.y) < 1){
      this.yOld = this.y;
    }

    if(this.id === playerID){
      this.drawHPBar();
      this.hpBarOffset = 5;
    }

    this.drawPlayer(this.isMoving(), PLAYERSPRITEWIDTH, PLAYERSPRITEHEIGHT);

    this.drawName();
  }

  setDirection() {
    // down = 0, left = 1, right = 2, up = 3
    let deltaX = this.x - this.xOld;
    let deltaY = this.y - this.yOld;
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

  drawHPBar() {
    ctxEntities.fillStyle = "#000000";
    ctxEntities.fillRect(this.xOld - hpBarWidth/2,this.yOld - 32,30, 4);
    let hpWidth = hpBarWidth * this.hp/this.hpMax;
    if(this.hp === this.hpMax){
      ctxEntities.fillStyle = "#0000FF";
    } else{
      let hpPercent = this.hp/this.hpMax;
      let green = parseInt(Math.floor(255 * hpPercent));
      let red = 255 - green;
      ctxEntities.fillStyle = getHexRGB(red, green, 0);
    }
    ctxEntities.fillRect(this.xOld - hpBarWidth/2,this.yOld - 32,hpWidth, 4);
    ctxEntities.fillStyle = "#000000";
  }

  drawName() {
    ctxEntities.textAlign="center"
    ctxEntities.font = "8pt Arial Black";
    ctxEntities.fillText(this.name, this.xOld, this.yOld - 30 - this.hpBarOffset);
  }

  isMoving() {
    if(this.xOld !== this.x || this.yOld !== this.y){
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
      ctxEntities.drawImage(Img.player.playerFull, index*57 || 57*0, 57*this.direction, 57, 57, this.xOld-width/2, this.yOld-height/2, 57, 57);

      if(Date.now() - this.stateTime >= ANIMATIONTIME){
        this.runState = 1;
        this.stateTime = Date.now();
      }

    } else if(this.runState === 1) {
      ctxEntities.drawImage(Img.player.playerFull, index*57 || 57*1, 57*this.direction, 57, 57, this.xOld-width/2, this.yOld-height/2, 57, 57);

      if(Date.now() - this.stateTime >= ANIMATIONTIME/2){
        this.runState = 2;
        this.stateTime = Date.now();
      }

    } else if(this.runState === 2) {
      ctxEntities.drawImage(Img.player.playerFull, index*57 || 57*2, 57*this.direction, 57, 57, this.xOld-width/2, this.yOld-height/2, 57, 57);

      if(Date.now() - this.stateTime >= ANIMATIONTIME){
        this.runState = 0;
        this.stateTime = Date.now();
      }
    }
  }

}
