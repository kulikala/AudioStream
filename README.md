AudioStream - Streaming audio using Firefox Audio Data API + Node.js + WebSocket + Redis Pub/Sub
===========================

This is an experimental application runs with Firefox, Node.js, and Redis.


## Overall architecture

	client <Firefox>
	      | - Play audio
	  (WebSocket)
	      |
	HTTP server <Node.js>
	      | - Publish
	  (DB Connection)
	      |
	Pub/Sub server <Redis>
	      |
	  (DB Connection)
	      | - Subscribe
	HTTP server 2 <Node.js>
	      |
	  (WebSocket)
	      | - Push
	client 2 <Firefox>
	        - Listen audio


## Requirements

* Node.js v0.4.11
* npm
  * [express](http://expressjs.com/)
  * [opts](https://bitbucket.org/mazzarelli/js-opts/wiki/Home)
  * [redis](https://raw.github.com/mranney/node_redis/)
  * [websocket](https://github.com/Worlize/WebSocket-Node)
* Redis v2.2.5


## Browser Support

* Firefox Aurora 7 (Protocol Version 8 - according to [websocket](https://github.com/Worlize/WebSocket-Node) library)
* Firefox 6 (Protocol Version 7 - checkout [websocket draft-07 branch](https://github.com/Worlize/WebSocket-Node/blob/draft-07)


## Usage

Install Node.js first.

	$ node -v
	v0.4.11

Install required npm libraries:

	$ npm -v
	1.0.26
	$ npm install express opts redis websocket

Install Redis.

	$ redis-server -v
	Redis server version 2.2.5 (00000000:0)

Start Redis server:

	$ redis-server

With your configured `redis.conf`, start Redis server with:

	$ redis-server /opt/local/etc/redis.conf

Start Node.js with `server.js`

	$ sudo node server.js

By default, the program listens the port 80.
You can specify the port number to which the HTTP server and WebSocket server listen:

	$ node server.js -p 8080

Open browser(s) and access the server(s).
Press "Connect" button to establish WebSocket connection.

For publishing the audio data, press "Load & Play" button.
After loading the audio resource, immediately starts playing and publishing the audio data.

For subscribing the audio data, press "Start receiving" button.
You can receive the audio data, as long as the background server is connected to the same Redis server.


If you own several computers and they're beside you, you can try multiple Node.js instances:

	$ node server.js -p 8000
	$ node server.js -p 8001
	$ node server.js -p 8002
	    .
	    .
	    .

Then, access each Node.js instances by browsers, and establish WebSocket connections.
Press "Start receiving" buttons except one browser.
Then, press "Load & Play" button on the remaining browser.
All browsers will start playing the audio.


## Note

Most of the enviroments support 44,100Hz 2 channels sound.
Since Firefox does not support WebSocket's binary data frame yet and AudioStream directly uses raw audio data with `Float32Array`, AudioStream marshals raw audio data into hex string. An element in the `Float32Array` is 4 bytes and is doubled when converted to hex string. If the audio data is 44,100Hz 2 channels sound, then the band width requires at least 44100 samples/sec * 2 channels * 4 bytes * 2 = 705,600 bytes/sec per connection.


## LICENSE - "MIT License"

Copyright (C) 2011 Kulikala. All Rights Reserved.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
