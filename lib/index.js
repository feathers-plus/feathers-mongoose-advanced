var functionList = require('async').seq;
var errors = require('feathers').errors.types;

// A filter to be used in 'find'
var prepareSpecials = require('./filters/query.prepareSpecials.js');

// A filter to be used in 'update'
var removeID = require('./filters/data.removeID.js');

/**
 * Turn a MongoError into a human-readable error.
 * @param  {MongoError} err
 * @return {feathers.error} A feathers-style error.
 */
var getError = function(err){
	switch(err.code){
		case 11000:
			return new errors.Conflict(err.err);

		default:
			console.log(err);
			return err;
	}
};

module.exports = function(Model, filters) {

	// TODO: Simplify the next 30 lines.
	if (!filters) {
		filters = {
		  find:   { params:[], query:[], resData:[] },
		  get:    { params:[], query:[], resData:[] },
		  create: { reqData:[], resData:[] },
		  update: { reqData:[], query:[], resData:[] },
		  remove: { query:[], resData:[] },
		};
	}

	/* Merge default filters with any passed filters. */
	// TODO: implement PATCH
	var defaults = {
		find:   { params:[], query:[prepareSpecials], resData:[] },
		get:    { query:[], resData:[] },
		create: { reqData:[], resData:[] },
		update: { reqData:[removeID], query:[], resData:[] },
		remove: { query:[], resData:[] },
	};

	// Loop through defaults' methods
	Object.keys(defaults).forEach(function(method){
		// Loop through method types
		var defaultMethod = defaults[method];
		Object.keys(defaultMethod).forEach(function(type){
			// If the corresponding filter was passed in filters...
			if (filters[method] && filters[method][type]) {
				// Concat the arrays
				defaults[method][type] = defaults[method][type].concat(filters[method][type]);
			}
		});
	});

	filters = defaults;


	// Helper. Allows us to modify the params before creating a query out of them.
	var runParamsFilters = function(filterSet, id, params, callback, next){
		var paramsFilters = functionList.apply(this, filterSet);
		paramsFilters(params, callback, next);
	};

	// Helper. Allows us to modify the query before it hits the database server.
	var runQueryFilters = function(filterSet, query, params, callback, next){
		var queryFilters = functionList.apply(this, filterSet);
		queryFilters(query, params, callback, next);
	};

	// Helper. Allows us to modify the data before we send it to the client.
	var runDataFilters = function(filterSet, data, params, callback, next){
		var responseFilters = functionList.apply(this, filterSet);
		responseFilters(data, params, callback, next);
	};


	var mongooseService = {
		find: function(params, callback) {

			// Run filters on params.
			var filterSet = filters.find.params;
			runParamsFilters(filterSet, null, params, callback, function(err, params){

				if (err) {
					return callback(getError(err));
				}

				// Build the query with possibly-processed params.
				var query = Model.find(params.query);

				// Run query filters.
				var filterSet = filters.find.query;
				runQueryFilters(filterSet, query, params, callback, function(err, query){

					if (err) {
						return callback(getError(err));
					}

					// Execute the query
					query.exec(function(err, data) {

						if (err) {
							return callback(getError(err));
						}

						// Run filters on data after we get it back from the db, before sending to the client.
						var filterSet = filters.find.resData;
						runDataFilters(filterSet, data, params, callback, function(err, data){

							if (err) {
								return callback(getError(err));
							}

							// Send response.
							callback(err, data);
						});
					});
				});
			});
		},
		get: function(id, params, callback) {

			// TODO: enable fields and query options.
			// var query = Model.findById(id, /*query.fields*/, query.options);

			// Build the query using the id.
			var query = Model.findById(id);

			// Run query filters.
			var filterSet = filters.get.query;
			runQueryFilters(filterSet, query, params, callback, function(err, query){

				if (err) {
					return callback(getError(err));
				}

				// Execute the query
				query.exec(function(err, data) {

					if (err) {
						return callback(getError(err));
					}

					// Run filters on data after we get it back from the db, before sending to the client.
					var filterSet = filters.get.resData;
					runDataFilters(filterSet, data, params, callback, function(err, data){

						if (err) {
							return callback(getError(err));
						}

						// Send response.
						callback(err, data);
					});
				});
			});
		},
		create: function(data, params, callback) {

			// Filter data before sent to the database.
			var filterSet = filters.create.reqData;
			runDataFilters(filterSet, data, params, callback, function(err, data){

				if (err) {
					return callback(getError(err));
				}

				// Save the object.
				var obj = new Model(data);
				obj.save(function (err, data) {

					if (err) {
						return callback(getError(err));
					}

					// Run filters on data after we get it back from the db, before sending to the client.
					var filterSet = filters.create.resData;
					runDataFilters(filterSet, data, params, callback, function(err, data){

						if (err) {
							return callback(getError(err));
						}

						// Send response.
						callback(null, data);
					});
				});
			});
		},
		update: function(id, data, params, callback) {

			// Filter data before sent to the database.
			var filterSet = filters.update.reqData;
			runDataFilters(filterSet, data, params, callback, function(err, data){

				if (err) {
					return callback(getError(err));
				}

				// Build the query with possibly-processed params.
				var query = Model.findByIdAndUpdate(id, data, { upsert: false });

				// Run query filters.
				var filterSet = filters.update.query;
				runQueryFilters(filterSet, query, params, callback, function(err, query){

					// Execute the query
					query.exec(function(err, data) {

						if (err) {
							return callback(getError(err));
						}

						// Run filters on data after we get it back from the db, before sending to the client.
						var filterSet = filters.update.resData;
						runDataFilters(filterSet, data, params, callback, function(err, data){

							if (err) {
								return callback(getError(err));
							}

							// Send response.
							callback(err, data);
						});
					});
				});
			});
		},
		remove: function(id, params, callback) {

			// Build the query with possibly-processed params.
			var query = Model.findByIdAndRemove(id);

			// Run query filters.
			var filterSet = filters.remove.query;
			runQueryFilters(filterSet, query, params, callback, function(err, query){

				if (err) {
					return callback(getError(err));
				}

				// Execute the query
				query.exec(function(err, data) {

					if (err) {
						return callback(getError(err));
					}

					// Run filters on data after we get it back from the db, before sending to the client.
					var filterSet = filters.remove.resData;
					runDataFilters(filterSet, data, params, callback, function(err, data){

						if (err) {
							return callback(getError(err));
						}

						// Send response.
						callback(err, data);
					});
				});
			});
		},
		setup: function(app) {
			this.lookup = app.lookup.bind(app);
		}
	};


	return mongooseService;
};