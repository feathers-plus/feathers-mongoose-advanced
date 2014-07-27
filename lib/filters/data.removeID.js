'use strict';

/* Because mod on _id is not an option in MongoDB, remove
 * the _id and id from the data. This will probabaly be used
 * only as a utility for update. */
module.exports = function(data, params, callback, next){

	delete data.id;
	delete data._id;

	// Pass to next filter. Passing null instead of errors.
	next(null, data, params, callback);
};
