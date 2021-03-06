var createChat = function (server) {
  var io = require('socket.io')(server);

  io.on('connection', function(socket) {
    nicknames[socket.id] = "Guest-"+(guestNumber);
    guestNumber += 1;
    joinRoom(socket, 'lobby');
    updateRoomList();

    socket.on('outgoingMessage', function(msg) {
      handleMessage(msg, socket);
    });

    socket.on('nicknameChangeRequest', function(name) {
      handleNameRequest(name, socket)
    });

    socket.on('joinRoomRequest', function (newRoom) {
      handleRoomChangeRequest(socket, newRoom);
    });

    socket.on('commandFailure', function(comm) {
      socket.emit('systemMessage', "Command not recognized: " + comm);
    });

    socket.on('disconnect', function() { handleDisconnect(socket) });
  });

  var handleDisconnect = function(socket) {
    leaveRoom(socket);
    updateRoomList();
    delete nicknames[socket.id];
  };

  var handleMessage = function(msg, socket) {
    var printMsg = (nicknames[socket.id] + ": " + msg);
    io.to(currentRooms[socket.id]).emit('printMessage', printMsg);
  };

  var handleNameRequest = function(name, socket) {
    if (checkName(name)) {
      oldName = nicknames[socket.id];
      nicknames[socket.id] = name;
      io.to(currentRooms[socket.id]).emit(
        'nicknameChangeSuccess', { newName: name, oldName: oldName }
      );
      updateRoomList();
    } else {
      socket.emit('nicknameChangeFailure', 'Name change failed!')
    }
  };

  var checkName = function (newname) {
    for (var nickname in nicknames) {
      if (nickname === newname) {
        return false
      } else if (newname.toLowerCase().substring(0, 5) === 'guest') {
        return false
      }
    }
    return true;
  };

  var joinRoom = function (socket, newRoom) {
    socket.join(newRoom);
    console.log("Joining room.");
    currentRooms[socket.id] = newRoom;

    console.log(currentRooms);
    io.to(currentRooms[socket.id]).emit('systemMessage',
      nicknames[socket.id] + " has joined " + currentRooms[socket.id]
    );

    addToRoom(newRoom, socket);
  }

  var addToRoom = function (newRoom, socket) {
    if(roomList[newRoom] === undefined) {
      roomList[newRoom] = [socket.id];
    } else {
      roomList[newRoom].push(socket.id);
    }
  };

  var handleRoomChangeRequest = function (socket, newRoom) {
    leaveRoom(socket);
    joinRoom(socket, newRoom);
    updateRoomList();
  };

  var leaveRoom = function (socket) {
    var oldRoom = currentRooms[socket.id];
    io.to(oldRoom).emit('systemMessage',
      nicknames[socket.id] + " has left " + oldRoom
    );

    socket.leave(oldRoom);
    currentRooms[socket.id] = '';

    var targetIndex = roomList[oldRoom].indexOf(socket.id);
    roomList[oldRoom].splice(targetIndex, 1);
  };

  var updateRoomList = function () {
    io.emit('roomChange', { roomList: roomList, nicknames: nicknames });
    console.log("roomlist: ", roomList);
  }

  var guestNumber = 1;
  var nicknames = {}; //indexed by session.id
  var currentRooms = {}; //indexed by session.id
  var roomList = { lobby: [] }; // room names tied to arrays of session.id's
};

// Sends the createChat function out for use in other files.
module.exports = createChat;