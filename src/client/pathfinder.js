const MAX_DIST = 999999999; // arbitrary large number

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.parentNode = null;
    this.f = MAX_DIST;
    this.g = undefined;
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function calcEuclideanDistance(startCoord, endCoord) {
  return Math.sqrt(Math.pow((endCoord.x - startCoord.x), 2) + Math.pow((endCoord.y - startCoord.y), 2));
}

function calcManhattanDistance(startCoord, endCoord) {
  return (endCoord.x - startCoord.x) + (endCoord.y - startCoord.y);
}

function getNeighbourNodes(node) {
  let neighbourNodes = [];
  // check the 4 cardinal directions, create node for the ones that are walkable

  // up
  if ((node.y - 1 >= 0) && !tileData[MAP_WIDTH * (node.y - 1) + node.x].hasCollision()) {
    neighbourNodes.push(new Node(node.x, node.y - 1));
  }
  // down
  if ((node.y + 1 < MAP_HEIGHT) && !tileData[MAP_WIDTH * (node.y + 1) + node.x].hasCollision()) {
    neighbourNodes.push(new Node(node.x, node.y + 1));
  }
  // left
  if ((node.x - 1 >= 0) && !tileData[MAP_WIDTH * node.y + (node.x - 1)].hasCollision()) {
    neighbourNodes.push(new Node(node.x - 1, node.y));
  }
  // right
  if ((node.x + 1 < MAP_WIDTH) && !tileData[MAP_WIDTH * node.y + (node.x + 1)].hasCollision()) {
    neighbourNodes.push(new Node(node.x + 1, node.y));
  }

  return neighbourNodes;
}

function getNeighbourNodesMock(node) {
  return [new Node(node.x, node.y - 1), new Node(node.x, node.y + 1), new Node(node.x - 1, node.y), new Node(node.x + 1, node.y)];
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
  let timeElapsed = 0;
  let start = Date.now();

  let currentNode = new Node(startCoord.x, startCoord.y);
  currentNode.f = 0;
  currentNode.g = currentNode.f + calcEuclideanDistance(startCoord, endCoord);

  let openSet = [];
  let closedSet = [];

  openSet.push(currentNode);

  while (openSet.length > 0) { // there are still nodes to consider
    // find the next highest priority node to expand
    let highestPriorityNode = openSet[0];
    for (let node in openSet) {
      if (openSet[node].g < highestPriorityNode.g) {
        highestPriorityNode = openSet[node];
      }
    }

    currentNode = highestPriorityNode; // the node we are currently expanding

    // reached the end
    if (currentNode.x == endCoord.x && currentNode.y == endCoord.y) {
      console.log(timeElapsed);
      return reconstructPath(currentNode);
    }

    // remove current node from open set, place it in closed set
    let index;
    if (index = findNodeInSet(currentNode, openSet)) {
      closedSet.push(openSet.splice(index, 1)[0]);
    }

    let neighbours = shuffle(getNeighbourNodes(currentNode));

    for (n in neighbours) {
      let currentNeighbour = neighbours[n];
      if (!findNodeInSet(currentNeighbour, openSet)) {
        openSet.push(currentNeighbour);
      }

      let newDistFromStart = currentNode.f + 1; // all nodes are only 1 tile apart
      if (newDistFromStart >= currentNeighbour.f) {
        continue;
      }

      currentNeighbour.parentNode = currentNode;
      currentNeighbour.f = newDistFromStart;
      currentNeighbour.g = currentNeighbour.f + calcEuclideanDistance(
        {x: currentNeighbour.x, y: currentNeighbour.y},
        {x: endCoord.x, y: endCoord.y});
    }

    timeElapsed += Date.now() - start
    if (timeElapsed > 50) { // taking too long to find path, likely doesnt exist
      console.log("Sorry, not possible.");
      return null;
    }
    start = Date.now();
  }

  return null; // path not found
}
