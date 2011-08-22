#!/usr/bin/env node
//---------------------------------------------------------------------------
// server.js
//---------------------------------------------------------------------------
// Copyright (C) 2011 Kulikala. All Rights Reserved.
//---------------------------------------------------------------------------



//---------------------------------------------------------------------------
// Configurations
//---------------------------------------------------------------------------
var config = {
	http: {
		defaultPort: 80,
		indexFile: '/index.html',
		resourceDir: 'public',
	},

	redis: {
		port: 6379,
		host: 'localhost',
		subscriptionChannel: 'data'
	}
};


//---------------------------------------------------------------------------
// Requires
//---------------------------------------------------------------------------
var $r = {
	express: require('express'),
	opts: require('opts'),
	redis: require('redis'),
	websocket: require('websocket'),

	uid: require('./uid')
};


//---------------------------------------------------------------------------
// Parse options
//---------------------------------------------------------------------------
$r.opts.parse( [
	{
		short: 'p',
		long: 'port',
		description: 'Port to open',
		value: true,
		required: false
	}
] );


//---------------------------------------------------------------------------
// Setup HTTP server
//---------------------------------------------------------------------------
var app = $r.express.createServer();
var serverPort = $r.opts.get('port') || config.http.defaultPort;

app.configure( function () {
	app.use( $r.express.static( __dirname + '/' + config.http.resourceDir ) );
} );
app.get( '/', function (request, response) {
	app.render( config.http.indexFile );
} );

app.listen(serverPort, function () {
	console.log( (new Date()) + ' : Server is listening on port ' + serverPort + '.' );
} );


//---------------------------------------------------------------------------
// Setup WebSocket server
//---------------------------------------------------------------------------
var wsConnections = [];
var wsServer = new $r.websocket.server( {
	httpServer: app,
	autoAcceptConnections: true
} );

wsServer.broadcast = function (message, conToExclude) {
	// Loop for each connections in the array
	wsConnections.forEach( function (connection) {
		// If second parameter is set and matches the uid of the connection,
		if (conToExclude && connection.uid && conToExclude == connection.uid) {
			// Skip
			return;
		}

		// Send the message
		connection.sendUTF(message);
	} );
};


//---------------------------------------------------------------------------
// WebSocket server event handlers
//---------------------------------------------------------------------------
wsServer.on( 'connect', function (connection) {
	console.log( (new Date()) + ' : Connection accepted.');

	// Generate uid for each connection
	connection.uid = $r.uid.generate();
console.log( 'UID : ' + connection.uid );
	wsConnections.push(connection);

	connection.on( 'message', function (message) {
		var data;
		if (message.type === 'utf8') {
			data = message.utf8Data;
		} else if (message.type === 'binary') {
			data = message.binaryData;
		}

		//console.log( (new Date()) + ' : Data received - type: ' + message.type + ' len: ' + data.length );

		publisher.publish( 'data', connection.uid + '@' + data );
	} );

	connection.on( 'close', function () {
		console.log( (new Date()) + ' : Connection ' + connection.remoteAddress + 'disconnected.');
		wsConnections.splice(wsConnections.indexOf(connection), 1);
	} );
} );


//---------------------------------------------------------------------------
// Setup Redis client
//---------------------------------------------------------------------------
var publisher = $r.redis.createClient(config.redis.port, config.redis.host);
var subscriber = $r.redis.createClient(config.redis.port, config.redis.host);

publisher.on( 'error', function (err) {
	console.log( (new Date()) + ' : Redis error - ' + err );
} );

subscriber.subscribe(config.redis.subscriptionChannel);

subscriber.on( 'error', function (err) {
	console.log( (new Date()) + ' : Redis error - ' + err );
} );

subscriber.on( 'message', function (channel, message) {
	//console.log( (new Date()) + ' : Redis message - ' + channel) ;

	if (channel == config.redis.subscriptionChannel) {
		// Split uid and message content,
		//     <message> = <uid> @ <message content>
		var pos = message.indexOf('@');
		var uid = message.substring(0, pos);
		var content = message.substring(pos + 1);

		// Broadcast the message except to the connection having the uid
		wsServer.broadcast(content, uid);
	}
} );


//---------------------------------------------------------------------------
// End
//---------------------------------------------------------------------------
