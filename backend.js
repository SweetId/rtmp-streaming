const NodeMediaServer = require('node-media-server');
const uuid = require('uuid');

// List of all public streams
var all_streams = [];
var nms;

function start(config)
{
	// Generate random key
	if (config.backend.auth.play === true)
	{
		const guid = uuid.v4();
		config.backend.auth.secret = guid;
		console.log('secret guid: ' + config.backend.auth.secret);
	}

	// RTMP server and backend
	nms = new NodeMediaServer(config.backend)
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

		// StreamPath should be in the form '/live/streamname'
		var path = StreamPath.split('/');
		if (path.length == 3)
		{
		// if streamname starts with '_' it is a private stream, don't list it
		if (path[2][0] != '_')
		  all_streams.push(path[2]);
		}
	});

	nms.on('postPublish', (id, StreamPath, args) => {
		console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});

	nms.on('donePublish', (id, StreamPath, args) => {
		console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

		var path = StreamPath.split('/');
		if (path.length == 3)
		{
		// Removing stream from list of all streams
		const index = all_streams.indexOf(path[2]);
		if (index > -1)
		  all_streams.splice(index, 1);
		}
	});

	nms.on('prePlay', (id, StreamPath, args) => {
		console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});

	nms.on('postPlay', (id, StreamPath, args) => {
		console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});

	nms.on('donePlay', (id, StreamPath, args) => {
		console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
	});
}

function getstreams() { return all_streams; }

module.exports =
{
	start : start,
	getstreams : getstreams
}