$(document).ready(function() {
  if (typeof ChatApp === 'undefined') {
    window.ChatApp = {};
  }
  var socket = io();

  var chat = new ChatApp.Chat(socket);

  var getMessage = function () {
    msg = $('.msg-entry').val();
    $('.msg-entry').val('');
    chat.handleMessage(msg);
  };

  var updateRoomlist = function (roomList) {

  }

  var displayMessage = function (msg) {
    $('.chat-log').append($('<li>').text(msg));
  };

  $('.send-message').submit(function(event) {
    event.preventDefault();
    getMessage(event);
  });

  $(document).ready(function(){
    socket.on('printMessage', function (msg) {
      displayMessage(msg);
    });

    socket.on('roomChange', function(roomList) {
      $list = $('.room-list')
      $list.empty();
      for (var room in roomList) {
        $roomLi = $('<li>').text(room);
        $list.append($roomLi);
        userList = roomList[room];
        $userUl = $('<ul>');
        $roomLi.append($userUl);
        for (user in userList) {
          $userUl.append($('<li>').text(user));
        }
      }
    });

    socket.on('systemMessage', function(msg) {
      displayMessage("SYSTEM: " + msg);
    });

    socket.on('nicknameChangeSuccess', function(data) {
      var message = (
        data['oldName'] + " has changed their name to " + data['newName']
      )
      displayMessage(message);
    });

    socket.on('nicknameChangeFailure', function(msg) {
      displayMessage(msg);
    });
  });
});