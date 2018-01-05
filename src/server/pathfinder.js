// everything to do with pathfinding is in this file

let CT = require('../constants.js');
let Game = require('./game.js');

const MAX_DIST = 999999999; // arbitrary large number

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.parentNode = null;
    this.distFromStart = MAX_DIST;
    this.distToEnd = undefined;
  }
}

function calcEuclideanDistance(startCoord, endCoord) { // end coord passed into findPath
  // calc euclidean dist
  return Math.sqrt(Math.pow((endCoord.x - startCoord.x), 2) + Math.pow((endCoord.y - startCoord.y), 2));
}

function getNeighbourNodes(node) {
  let neighbourNodes = [];
  // check the 4 cardinal directions, create node for the ones that are walkable

  let gameInstance = new Game();
  let tileMap = gameInstance.getTileMap();

  // up
  if ((node.y - 1 >= 0) && !tileMap[CT.MAP_WIDTH * (node.y - 1) + node.x].hasCollision()) {
    neighbourNodes.push(new Node(node.x, node.y - 1));
  }
  // down
  if ((node.y + 1 < CT.MAP_HEIGHT) && !tileMap[CT.MAP_WIDTH * (node.y + 1) + node.x].hasCollision()) {
    neighbourNodes.push(new Node(node.x, node.y + 1));
  }
  // left
  if ((node.x - 1 >= 0) && !tileMap[CT.MAP_WIDTH * node.y + (node.x - 1)].hasCollision()) {
    neighbourNodes.push(new Node(node.x - 1, node.y));
  }
  // right
  if ((node.x + 1 < CT.MAP_WIDTH) && !tileMap[CT.MAP_WIDTH * node.y + (node.x + 1)].hasCollision()) {
    neighbourNodes.push(new Node(node.x + 1, node.y));
  }

  return neighbourNodes;
}

// return array of Nodes that represent the determined path
function reconstructPath(endNode) {
  let path = [];

  let currentNode = endNode;
  path.push(currentNode);

  while (currentNode = currentNode.parentNode) {
    path.push(currentNode);
  }

  return path.reverse();
}

function findNodeInSet(thisNode, set) {
  for (let node in set) {
    if (set[node].x == thisNode.x && set[node].y == thisNode.y) {
      return node; // the index
    }
  }

  return null;
}

function findPath(startCoord, endCoord) {
  let currentNode = new Node(startCoord.x, startCoord.y);
  currentNode.distFromStart = 0;
  currentNode.distToEnd = calcEuclideanDistance(startCoord, endCoord);

  let openSet = [];
  let closedSet = [];

  openSet.push(currentNode);

  while (openSet.length > 0) { // there are still nodes to consider
    // find the next highest priority node to expand
    let highestPriorityNode = openSet[0];
    for (let node in openSet) {
      if (openSet[node].distToEnd < highestPriorityNode.distToEnd) {
        highestPriorityNode = openSet[node];
      }
    }

    currentNode = highestPriorityNode; // the node we are currently expanding

    // reached the end
    if (currentNode.x == endCoord.x && currentNode.y == endCoord.y) {
      return reconstructPath(currentNode);
    }

    // remove current node from open set, place it in closed set
    let index;
    if (index = findNodeInSet(currentNode, openSet)) {
      closedSet.push(openSet.splice(index, 1)[0]);
    }

    let neighbours = getNeighbourNodes(currentNode);

    for (n in neighbours) {
      let currentNeighbour = neighbours[n];
      if (!findNodeInSet(currentNeighbour, openSet)) {
        openSet.push(currentNeighbour);
      }

      let newDistFromStart = currentNode.distFromStart + 1; // all nodes are only 1 tile apart
      if (newDistFromStart >= currentNeighbour.distFromStart) {
        continue;
      }

      currentNeighbour.parentNode = currentNode;
      currentNeighbour.distFromStart = newDistFromStart;
      currentNeighbour.distToEnd = calcEuclideanDistance(
        {x: currentNeighbour.x, y: currentNeighbour.y},
        {x: endCoord.x, y: endCoord.y});
    }
  }

  return null; // path not found
}

module.exports = findPath;
