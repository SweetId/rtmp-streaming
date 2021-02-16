const express = require('express');
const http = require('http');
const ip = require('my-ip');
const NodeMediaServer = require('node-media-server');
const socketIo = require('socket.io');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: './media',
    webroot: './www',
    allow_origin: '*',
    api: true
  },
  auth: {
    api: true,
    api_user: 'admin',
    api_pass: 'admin',
    play: false,
    publish: false,
    secret: 'nodemedia2017privatekey'
  }
};

// Start RTMP server and backend
let nms = new NodeMediaServer(config)
nms.run();

nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

// Start client server and frontpage
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

var all_users = [];
io.on('connection', (socket) => {
  var current_room = 'none';
  var current_nickname = 'unnamed_viewer';
  var current_identifier = 'COMPUTER';

  socket.on('join room', function(room) {
    current_room = room;
    socket.join(current_room);
  });

  socket.on('login', function(username, identifier) {
    current_nickname = username;
    current_identifier = identifier;
    var address = socket.handshake.address;
    console.log(current_nickname + ' connected (' + current_identifier + '@' + address + ')');

    socket.to(current_room).emit('joined', current_nickname);
  });

  socket.on('new message', function(msg) {
    socket.to(current_room).emit('new message', { username: current_nickname, content: msg });
  });

  socket.on('disconnect', function() {
    socket.to(current_room).emit('left', current_nickname);

    var address = socket.handshake.address;
    console.log(current_nickname + ' disconnected (' + current_identifier + '@' + address + ')');
  });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('');
    console.log('Web server is running on:');
    console.log(`http://localhost:3000`);
    console.log(`http://${ip()}:3000`);
  });

  // Allow use of files inside public/
  app.use(express.static('public'));

  // View engine.
  app.set('view engine', 'ejs');
  app.set('views', 'pages');

  app.get('/:live', (req, res) => {
    res.render('index', { title:  req.params.live + ' TV' });
  });

  // used by video.js to retrieve server ip
  app.get('/:live/ip', (req, res) => {
    res.json({ path: 'ws://' + ip() + ':' + config.http.port + '/live/' + req.params.live + '.flv' });
  });