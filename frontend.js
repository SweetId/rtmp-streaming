const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const ip = require('my-ip');

var chatserver = require('./chatserver');

var app;
var server_http;
var server_https;

var io_http;
var io_https;


function start(config, backend)
{
	// CLIENT TV PAGES
	app = express();

	if ('http' in config.frontend)
	{
		server_http = http.createServer(app);
			server_http.listen(config.frontend.http.port, '0.0.0.0', () => {
			console.log('');
			console.log('Frontend HTTP web server is running on:');
			console.log('http://localhost:' + config.frontend.http.port);
			console.log(`http://${ip()}:` + config.frontend.http.port);
		});
		// start ChatServer
		io_http = chatserver.start(server_http);
	}

	if ('https' in config.frontend)
	{
		var privateKey  = fs.readFileSync(config.frontend.https.key, 'utf8');
		var certificate = fs.readFileSync(config.frontend.https.cert, 'utf8');
		var credentials = {key: privateKey, cert: certificate};
		
		server_https = https.createServer(credentials, app);
			server_https.listen(config.frontend.https.port, '0.0.0.0', () => {
			console.log('');
			console.log('Frontend HTTPS web server is running on:');
			console.log('https://localhost:' + config.frontend.https.port);
			console.log(`https://${ip()}:` + config.frontend.https.port);
		});
		// start ChatServer
		io_https = chatserver.start(server_https);
	}

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

	// Allow use of files inside public/
	app.use(express.static('public'));

	// View engine.
	app.set('view engine', 'ejs');
	app.set('views', 'pages');

	app.get('/streams', (req, res) => {
		res.json({ streams: backend.getstreams() });
	});

	app.get('/tv/:live', (req, res) => {
		res.render('index', { title:  req.params.live + ' TV' });
	});

	// used by video.js to retrieve server ip
	app.get('/tv/:live/ip', (req, res) => {
		if (req.secure)
		{
			res.json({ path: 'https://' + ip() + ':' + config.backend.https.port + '/live/' + req.params.live + '.flv' + generate_auth_key(req.params.live) });
		}
		else
		{
			res.json({ path: 'http://' + ip() + ':' + config.backend.http.port + '/live/' + req.params.live + '.flv' + generate_auth_key(req.params.live) });
		}
	});
}

module.exports = 
{
	start: start,
	gethttp: function() { return server_http; },
	gethttps: function() { return server_https; }
}