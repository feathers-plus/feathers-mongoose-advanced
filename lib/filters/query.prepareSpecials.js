'use strict';

/**
 * prepareSpecials - query modifier
 * 	Sets up the query properly if _limit, _skip, or _sort is passed in params.
 * 	Those same parameters are then removed from _conditions so that we aren't searching
 * 	for data with a _limit parameter.
 */
module.exports = function(query, params, callback, next){

	if (params.query) {

		// Handle $sort
		if (params.query.$sort){
			query.sort(params.query.$sort);
		}

		// Handle $limit
		if (params.query.$limit){
			query.limit(params.query.$limit);
		}

		// Handle $skip
		if (params.query.$skip){
			query.skip(params.query.$skip);
		}

		// Handle $select
		if (params.query.$select){
			query.select(params.query.$select);
		}


		// Remove the params from the query's _conditions.
		delete query._conditions.$sort;
		delete query._conditions.$limit;
		delete query._conditions.$skip;
		delete query._conditions.$select;
	}

	// Pass to next filter. Passing null instead of errors.
	next(null, query, params, callback);
};
