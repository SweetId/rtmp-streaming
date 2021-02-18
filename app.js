var config = require('./config');

// start RTMP
var backend = require('./backend');
backend.start(config);

// start FrontEnd
var frontend = require('./frontend');
frontend.start(config, backend);