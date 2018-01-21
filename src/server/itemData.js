// type => 1 = Weapon, 2 = Armor, 3 = Rune
// subtype => 1 = Universal

var itemData = {
  16: {
    "type": "weapon",
    "subtype": 1,
    "name": "Battle Axe",
    "atk": 45,
    "def": 12,
    "range": 1,
    "attackDelay": 1000,
    "levelReq": 1,
    "description": "A weapon once used by the Vikings. Heavy, but deadly."
  },
  17: {
    "type": "chest",
    "subtype": 1,
    "name": "Chest Armor",
    "atk": 12,
    "def": 100,
    "levelReq": 1,
    "description": "An armor fit for a king. Many have spoken about it, but very few have seen it's shine."
  },
  18: {
    "type": 3,
    "subtype": 1,
    "name": "Ultimate Healing Rune",
    "description": "Crafted by the druids of Jorgon, this powerful rune is capable of healing the wounds of those who use it."
  }
};

module.exports = itemData;
