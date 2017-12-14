var mongojs = require('mongojs');
var db = mongojs('localhost:27017/Jorgon', ['account', 'progress']);

var isValidPassword = function(data, cb){
  db.account.find({usernameKey:data.username.toUpperCase(), password:data.password}, function(err, res){
    if(res.length > 0){
      cb(true, res);
    } else {
      cb(false);
    }
  });
}

var isUsernameTaken = function(data, cb){
  db.account.find({usernameKey:data.username.toUpperCase()},function(err,res){
    if(res.length > 0){
      cb(true);
    } else {
      cb(false);
    }
  });
}

var addUser = function(data, cb){
  db.account.insert({usernameKey:data.username.toUpperCase(), username:data.username, password:data.password},function(err){
    if(!err){
      cb(true);
    } else {
      cb(false);
    }
  });
}

module.exports = {isValidPassword, isUsernameTaken, addUser}
