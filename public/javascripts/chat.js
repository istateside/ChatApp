$(document).ready(function() {
  if (typeof ChatApp === 'undefined') {
    window.ChatApp = {};
  }

  var Chat = ChatApp.Chat = function (socket) {
    this.socket = socket;
    this.room = 'lobby';
  };

  Chat.prototype.handleMessage = function (msg) {
    if (msg[0] === '/') {
      this.handleCommand(msg);
    } else {
      console.log('ping');
      this.socket.emit('outgoingMessage', msg);
    }
  };

  Chat.prototype.handleCommand = function (comm) {
    var command = comm.substring(0, 5)
    var parameters = comm.slice(6);
    if (command === '/nick') {
      this.socket.emit('nicknameChangeRequest', parameters);
    } else if (command === '/join') {
      this.socket.emit('joinRoomRequest', parameters);
      this.room = parameters;
    } else {
      this.socket.emit('commandFailure', command);
    }
  };

});