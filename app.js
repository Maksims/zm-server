var express = require('express');
var http = require('http');
var app = express();

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(8080);

global.Server = new (require('ws').Server)({
    server: server
});

require('./lib/world');
require('./lib/server');
require('./lib/loop');

process.on('uncaughtException', function(err) {
    console.log(err);
    console.log(err.stack);
    process.exit(0);
});
