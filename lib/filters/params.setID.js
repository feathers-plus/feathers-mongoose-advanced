'use strict';

/**
 * setID - params modifier
 * 	Turns params.id into params._id.
 */
module.exports = function(params, callback, next){


	if (params.id && !params._id) {
		console.log('toot');

		params._id = params.id;
		delete params.id;
	}

	// Pass to next filter. Passing null instead of errors.
	next(null, params, callback);
};
