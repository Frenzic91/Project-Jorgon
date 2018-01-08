let Game = require('./game.js');
let Entity = require('./entity.js');
let Utils = require('../utils.js');
let findPath = require('./pathfinder.js');
let gameInstance = new Game();

class Creature extends Entity {
    constructor() {
      super();
      this.name = "Jorgon Von Schnitzel";
      this.number = "" + Math.floor(10 * Math.random());
      this.x = 12;
      this.y = 14;
      this.spawnX = 12;
      this.spawnY = 14;
      this.attackDelay = 250;
      this.targetLastSeenPos = undefined;
      this.target = undefined;
      this.pathToTarget = undefined;
    }

    attackMelee() {
      // attack
    }

    findPlayerNearby(distFromPlayerX, distFromPlayerY) {
      return false;
    }

    roam() {
      let delta = Math.random() >= 0.5 ? 1 : -1;
      let randDir = Math.random();

      randDir >= 0.5 ? this.moveTo({x: this.x + delta, y: this.y}) : this.moveTo({x: this.x, y: this.y + delta});

      //console.log(this.x, this.y);
    }

    simulate() {
      // if nobody on screen, do nothing
      if (!this.target && !this.findPlayerNearby(5, 5)) {
        this.roam();
      } else {
        // if beside target
        let dist = this.getManhattanDistanceTo({x: this.target.x, y: this.target.y})
        if (dist.x <= 1 || dist.y <= 1) {
          this.attackMelee();
        } else if (isSamePos({x: this.targetLastSeenPos.x, y: this.targetLastSeenPos.y}, {x: this.target.x, y: this.target.y})) {
          this.moveTowardsTarget();
        } else {
          this.pathToTarget = findPath({x: this.x, y: this.y}, {x: this.target.x, y: this.target.y});
          this.targetLastSeenPos.x = this.target.x;
          this.targetLastSeenPos.y = this.target.y;
        }
      }
    }

    // handle all player attacks
    static simulateAll() {
      let creatureList = gameInstance.getCreatureList();
      for (let c in creatureList) {
        let creature = creatureList[c];
          creature.simulate();
      }
    }
}

module.exports = Creature;
