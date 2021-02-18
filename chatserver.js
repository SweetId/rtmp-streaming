const socketIo = require('socket.io');

var all_users = [];

function configure(server)
{
	server.on('connection', (socket) => {
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
}

function start(server)
{
	const io = socketIo(server);
	configure(io);
	return io;
}

module.exports = {
	start : start
}