const cors = require('cors');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const ip = require('my-ip');
const request = require('request');

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

	// Allow use of files inside public/
	app.use(express.static('public'));

	// View engine.
	app.set('view engine', 'ejs');
	app.set('views', 'pages');
	
	app.get('/streams', cors(), (req, res) => {
		res.json({ streams: backend.getstreams() });
	});

	app.get('/tv/:live', (req, res) => {
		res.render('index', { title:  req.params.live + ' TV' });
	});
	
	// used by video.js to retrieve server ip
	app.get('/tv/:live/ip', cors(), (req, res) => {
		var req_url = '';
		if (req.secure)
		{
			req_url = 'https://127.0.0.1:' + config.backend.https.port + '/tv/' + req.params.live + '/ip';
		}
		else
		{
			req_url = 'http://127.0.0.1:' + config.backend.http.port + '/tv/' + req.params.live + '/ip';
		}

		request(req_url, function(error, response, body) {
			res.json(JSON.parse(body));
		})
	});
}

module.exports = 
{
	start: start,
	gethttp: function() { return server_http; },
	gethttps: function() { return server_https; }
}