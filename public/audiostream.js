//---------------------------------------------------------------------------
// audiostream.js
//---------------------------------------------------------------------------
// Copyright (C) 2011 Kulikala. All Rights Reserved.
//---------------------------------------------------------------------------


( function (window) {

//---------------------------------------------------------------------------
// AudioStream
//---------------------------------------------------------------------------
var AudioStream = function () {
	/*
	 * Private properties and methods
	 */
	var _audio = new Audio();
	var _audioBuffer = [];
	var _available = false;
	var _bufPos = 0;

	/**
	 * Convert Float32Array into ArrayBuffer.
	 */
	var _binarify = function (array) {
		var buffer = new ArrayBuffer(array.length * array.BYTES_PER_ELEMENT);
		var f32arr = new Float32Array(buffer);
		f32arr.set(array);

		return buffer;
	};

	/**
	 * Marchaling data for sending across the network. 
	 */
	var _marshal = function (f32arr) {
		return JSON.stringify( {
			c: _audio.mozChannels,
			s: _audio.mozSampleRate,
			d: _stringify(f32arr)
		} );
	};

	/**
	 * Parse hex string and convert into Float32Array.
	 */
	var _parse = function (hexString) {
		var buffer = new ArrayBuffer(hexString.length / 2);
		var ui8arr = new Uint8Array(buffer);

		for (var i = 0; i < ui8arr.length; i++) {
			ui8arr[i] = parseInt(hexString.substr(i * 2, 2), 16);
		}

		return new Float32Array(buffer);
	};

	/**
	 * Returns a hex string representing the Float32Array.
	 */
	var _stringify = function (array) {
		var ui8arr = new Uint8Array(_binarify(array));
		var ret = [];

		for (var i = 0; i < ui8arr.length; i++) {
			16 > ui8arr[i] && ret.push('0');
			ret.push(ui8arr[i].toString(16));
		}

		return ret.join('');
	};

	/**
	 * Write Float32Array into the Audio object.
	 * This method will be executed asynchronously.
	 */
	var _writeAudioData = function () {
		// Repeat while data in the buffer
		while ( 0 < _audioBuffer.length ) {
			// Head data of the buffer
			var buffer = _audioBuffer[0];

			// Write audio frame into the Audio object
			var written = _audio.mozWriteAudio(buffer.subarray(_bufPos));

			// If all data wasn't written,
			if (_bufPos + written < buffer.length) {
				//  Keep it in the buffer
				_bufPos += written;
				break;
			} else {
				// Otherwise, drop it
				_audioBuffer.shift();
				_bufPos = 0;
			}
		}
	};


	/*
	 * Global properties and methods
	 */
	return {
		/**
		 * Returns the number of audio channels.
		 */
		channels: function () {
			return _audio.mozChannels;
		},

		/**
		 * Begin loading the audio media specified by the url.
		 */
		load: function (url) {
			_avilable = true;

			_audio.src = url;
			_audio.load();
		},

		/**
		 * Pauses the audio playback.
		 */
		pause: function () {
			_audio.pause();
		},

		/**
		 * Begins playback of the audio.
		 */
		play: function () {
			_audio.play();
		},

		/**
		 * Returns the sample rate per second.
		 */
		sampleRate: function () {
			return _audio.mozSampleRate;
		},

		/**
		 * Occurs when audio data is made available.
		 */
		onAudioData: function (callback) {
			_audio.addEventListener( 'MozAudioAvailable', function (event) {
				// Prepare marshalled data of the frame buffer
				event.audioData = _marshal(event.frameBuffer);

				// And give it to the callback function
				return callback(event);
			}, false );
		},

		/**
		 * Occurs when meta information is available.
		 */
		onMetadata: function (callback) {
			_audio.addEventListener( 'loadedmetadata', callback, false );
		},

		/**
		 * Occurs when the current playback position has changed.
		 */
		onTimeUpdate: function (callback) {
			_audio.addEventListener( 'timeupdate', callback, false );
		},

		/**
		 * Set and get the current audio volume, from 0.0 (silent) to 1.0 (maximum).
		 */
		volume: function (value) {
			if (typeof value === 'number' && 0 <= value && 1 >= value) {
				_audio.value = value;
			}

			return _audio.value;
		},

		/**
		 * Store audio data into the buffer and write then asynchronously.
		 */
		setAudioData: function (audioData) {
			// audioData is JSON string
			audioData = JSON.parse(audioData);

			// If not initialized yet,
			if (!_available) {
				// Setup audio channels and sample rate per second
				_audio.mozSetup(audioData.c, audioData.s);
				_available = true;
			}

			// Convert into Float32Array and store it
			_audioBuffer.push(_parse(audioData.d));

			// Call method later
			setTimeout( _writeAudioData, 1 );
		}
	};
};


/*
 * Static properties and methods
 */

/**
 * A factory method for AudioStream for playing a audio file.
 */
AudioStream.audioPlayer = function (url) {
	var as = new AudioStream();

	as.load(url);

	return as;
};


//---------------------------------------------------------------------------
// Exports to window scope
//---------------------------------------------------------------------------
window.AudioStream = AudioStream;

} )( window );


//---------------------------------------------------------------------------
// End
//---------------------------------------------------------------------------
