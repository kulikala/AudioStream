//---------------------------------------------------------------------------
// uid.js
//---------------------------------------------------------------------------
// Copyright (C) 2011 Kulikala. All Rights Reserved.
//---------------------------------------------------------------------------


// Export UIDGenerator instance as a module
module.exports = ( function () {

//---------------------------------------------------------------------------
// Requires
//---------------------------------------------------------------------------
var crypto = require('crypto');
var os = require('os');


//---------------------------------------------------------------------------
// UIDGenerator
//---------------------------------------------------------------------------
var UIDGenerator = function () {
	var counter = 0;

	return {
		generate: function () {
			// Store how many times this method is called
			counter++;

			// Prepare data to generate unique uid
			var data = [];

			// Set network interfaces info if available ( > v0.5.0 )
			os.getNetworkInterfaces && data.push(os.getNetworkInterfaces());

			// Set cpu information
			data.push(os.cpus());

			// Set process id
			data.push(process.pid);

			// Set counter
			data.push(counter);

			// Finally, set current time
			data.push(new Date());


			// Use md5 algorithms to generate hash
			var hash = crypto.createHash('md5');

			// Set string data to generate hash
			hash.update( JSON.stringify(data) );

			// Return hash value in hex format
			return hash.digest('hex');
		}
	}
};



//---------------------------------------------------------------------------
// Let's export a instance
//---------------------------------------------------------------------------

return new UIDGenerator();

} )();


//---------------------------------------------------------------------------
// End
//---------------------------------------------------------------------------
