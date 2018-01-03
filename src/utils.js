function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function randNumBetween(a, b) {
  return Math.floor((Math.random() * (b - a)) + a);
}

module.exports = {isNumeric, randNumBetween}
