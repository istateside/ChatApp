  var http   = require('http'),
      static = require('node-static');

  // uses the node-static library to set up a file server for the directory
  var  file  = new static.Server('./public');

  // uses the http library to create a server with a barebones req/res pattern
  var server = http.createServer(function (req, res) {
    req.addListener('end', function () {
      file.serve(req, res);
    }).resume();
  });

  server.listen(8000)
  /*
    Pulls the exports specified in the chat_server.js file;
    in this case, the only export was the CreateChat function,
    which has the logic for taking a server and setting it up
    to listen for message events and broadcast them.
  */
  var createChat = require('./chat_server');

  // passes the http server from line 8 into the createChat function.
  createChat(server);
