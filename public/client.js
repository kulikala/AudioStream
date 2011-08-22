//---------------------------------------------------------------------------
// client.js
//---------------------------------------------------------------------------
// Copyright (C) 2011 Kulikala. All Rights Reserved.
//---------------------------------------------------------------------------


( function () {

//---------------------------------------------------------------------------
// Window load event
//---------------------------------------------------------------------------
$( function () {
	var as;
	var ws;

	$('section.Connect input[type="text"]').val(
		'ws://' + location.hostname + ':' + (location.port || 80)
	);

	$('section.Connect button').click( function () {
		if (ws) {
			alert('Already connected.');
			return;
		}

		var url = $(this).prev('input[type="text"]').val();

		ws = new MozWebSocket(url);
		ws.binaryType = 'arraybuffer';
		ws.onopen = function (event) {
			log('Connect', 'Connected to the server.');
		};
	} );

	$('section.LoadAndPlay button.Play').click( function () {
		var audioResource = $(this).prev('input[type="text"]').val();

		if (!as) {
			as = AudioStream.audioPlayer(audioResource);
			as.onAudioData( function (event) {
				var sendData = event.audioData;
				ws && ws.send(sendData);
			} );
		}

		as.play();

		log('LoadAndPlay', 'Start playing the audio and sending frame buffer...');
	} );

	$('section.LoadAndPlay button.Stop').click( function () {
		if (!as) {
			return;
		}
		as.pause();

		log('LoadAndPlay', 'Stopped.');
	} );

	$('section.ReceiveAndPlay button.Start').click( function () {
		if (!ws) {
			return;
		}

		if (!as) {
			as = new AudioStream();
		}

		ws.onmessage = function (event) {
			as.setAudioData(event.data);
		};

		log('ReceiveAndPlay', 'Start waiting...');
	} );

	$('section.ReceiveAndPlay button.Stop').click( function () {
		if (!ws) {
			return;
		}

		ws.onmessage = null;

		log('ReceiveAndPlay', 'Stopped.');
	} );
} );


//---------------------------------------------------------------------------
// Utility
//---------------------------------------------------------------------------
var log = function (context, message) {
	$('section.' + context + ' div.Status').append( (new Date()) + ' : ' + message + '<br/>' );
};


//---------------------------------------------------------------------------
// End
//---------------------------------------------------------------------------

} )();
