var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');

var chatFocused = false;

var chatHistory = [];
const CHAT_HISTORY_LIMIT = 10;
var chatPointer = 0;

// Chat toggling functions
function chatFocus(flag) {
  chatFocused = flag;
}

function focusChat() {
  chatInput.focus();
  chatFocus(true);
}

function focusGame() {
  chatInput.blur();
  chatFocus(false);
}

function toggleChat(){
  if(chatFocused){
    focusGame();
  } else {
    focusChat();
  }
}

function addChatHistory(message){
  if(chatHistory.includes(message)){
    chatHistory.splice(chatHistory.indexOf(message),1);
  }
  if(chatHistory.length >= CHAT_HISTORY_LIMIT){
    chatHistory.splice(0,1);
  }
    chatHistory.push(message);
}

chatForm.onsubmit = function(e){
  e.preventDefault();
  if(chatInput.value.length === 0){

  } else if(chatInput.value[0] === '/'){
    socket.emit('evalServer', chatInput.value.slice(1));
    addChatHistory(chatInput.value);
  } else {
    socket.emit('sendMsgToServer', chatInput.value);
    addChatHistory(chatInput.value);
  }
  chatInput.value = '';
  chatPointer = chatHistory.length;
}

function updateChatScroll(){
    chatText.scrollTop = chatText.scrollHeight;
}

socket.on('addToChat', function(data){
  chatText.innerHTML += '<div class="chat-message">' + data + '</div>';
  updateChatScroll();
});

socket.on('evalAnswer', function(data){
  console.log(data);
});

chatInput.onkeyup = function(event){
  if(event.keyCode === 38 && chatPointer > 0){
    chatPointer--;
    chatInput.value = chatHistory[chatPointer];
  }
  else if(event.keyCode === 40 && chatPointer < chatHistory.length){
    chatPointer++;
    if(chatPointer < chatHistory.length){
      chatInput.value = chatHistory[chatPointer];
    }
    else {
      chatInput.value = "";
    }
  }
};
