const crypto = require('crypto');
const ip = require('my-ip');
const uuid = require('uuid');

const NodeMediaServer = require('node-media-server');

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

	// Noauth
	var generate_auth_key = function(live) { return ''; }
	if (config.backend.auth.play === true)
	{
		generate_auth_key = function(live) {
			const md5 = crypto.createHash('md5');
			let key = config.backend.auth.secret;

			let exp = (Date.now() / 1000 |0) + (3600*24); // 1 day expiration delay
			let stream = '/live/' + live;
			
			var token = exp + '-' + md5.update(stream + '-' + exp + '-' + key).digest('hex');
			return '?sign=' + token;
		}
	}

	// used by video.js to retrieve server ip
	// here we plug directly to the backend server
	nms.nhs.app.get('/tv/:live/ip', (req, res) => {
		if(req.secure)
		{
			if (config.backend.https.iptv_auth == false ||
				(req.query.auth === config.backend.https.iptv_secret))
			{
				res.json({ path: 'https://' + ip() + ':' + config.backend.https.port + '/live/' + req.params.live + '.flv' + generate_auth_key(req.params.live) });
			}
			else
				res.status(403);
		}
		else
		{
			if (config.backend.http.iptv_auth == false ||
				(req.query.auth === config.backend.http.iptv_secret))
			{
				res.json({ path: 'http://' + ip() + ':' + config.backend.http.port + '/live/' + req.params.live + '.flv' + generate_auth_key(req.params.live) });
			}
			else
				res.status(403);
		}
	});
	
	nms.nhs.app.get('/streams', (req, res) => {
		if(req.secure)
		{
			if (config.backend.https.iptv_auth == false ||
				(req.query.auth === config.backend.https.iptv_secret))
			{
				res.json({ streams: getstreams() });
			}
			else
				res.status(403);
		}
		else
		{
			if (config.backend.http.iptv_auth == false ||
				(req.query.auth === config.backend.http.iptv_secret))
			{
				res.json({ streams: getstreams() });
			}
			else
				res.status(403);
		}
	});
}

function getstreams() { return all_streams; }

module.exports =
{
	start : start,
	getstreams : getstreams
}