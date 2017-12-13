//Login or Register
var signDiv = document.getElementById('signDiv');
var signDivUsername = document.getElementById('signDiv-username');
var signDivPassword = document.getElementById('signDiv-password');
var signDivLogin = document.getElementById('signDiv-login');
var signDivRegister = document.getElementById('signDiv-register');
var signDivTest = document.getElementById('signDiv-test');
var gameDiv = document.getElementById('gameDiv');

signDivLogin.onclick = function(){
  socket.emit('login', {username:signDivUsername.value, password:signDivPassword.value});
}

signDivRegister.onclick = function(){
  socket.emit('register', {username:signDivUsername.value, password:signDivPassword.value});
}

signDivTest.onclick = function(){
  socket.emit('login', {username:"test", password:"1234"});
}

socket.on('loginResponse', function(data){
  if(data.success){
    signDiv.style.display = 'none';
    gameDiv.style.display = 'inline-block';
  } else {
    alert('Login Unsuccessful!');
  }
});

socket.on('registerResponse', function(data){
  if(data.success){
    alert('Registration Successful!');
  } else {
    alert('Registration Unsuccessful!');
  }
});
