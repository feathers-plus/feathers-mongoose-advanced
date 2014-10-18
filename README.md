feathers-mongoose-advanced Service
=========================

[![NPM](https://nodei.co/npm/feathers-mongoose-service.png?downloads=true&stars=true)](https://nodei.co/npm/feathers-mongoose-service/)


> Create a flexible [Mongoose](http://mongoosejs.com/) Service for [Featherjs](https://github.com/feathersjs).


## Installation

```bash
npm install feathers-mongoose-advanced --save
```

## Getting Started

A feathers-mongoose-advanced service has three parts:

### 1. The Mongoose Model.

Create a Mongoose model the same way that you normally would.  Here is an example todos model:

```js
var mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId,
  MongooseService = require('feathers-mongoose-advanced-service');

// Set up the schema
var schema = new mongoose.Schema({
  description: String,
  done: Boolean,
  userID: ObjectId
});

// Create a virtual field for id by copying _id.
schema.virtual('id').get(function(){
    return this._id.toHexString();
});
// Ensure virtual fields are serialised.
schema.set('toJSON', {virtuals: true});
schema.set('toObject', {virtuals: true});

// External access to the model.
exports.model = mongoose.model('Todo', schema);
```

### 2. The Filter Object. (optional now that feathers-hooks exists.)

The filter object provides a "middleware" layer that allows you to insert functions into specific parts of the service, making more advanced functionality possible. Here is an example of what it would look like to make sure the userID field in the above model gets populated:

```js
// Filter middleware to add the userID to a Mongoose query.
var queryWithUserID = function(query, params, callback, next){

	// Requires auth to be set up on the feathers server to work.
	if (params.user) {

		// Add a userID to the query conditions.
		query._conditions.userID = params.user._id;
	}
	next(null, query, params, callback);
};

// Filter middleware to add the userID to `POST`ed data.
var dataSetUserID = function(data, params, callback, next){

	// Again, requires auth to be set up on the server.
	data.userID = params.user._id;
	next(null, data, params, callback);
};

// Filter middleware to add useless info to `POST`ed data.
var dataAddNonsense = function(data, params, callback, next){
	// Won't be saved to the db, since the model doesn't have a
	// movieQuote attribute.
	data.movieQuote = "I got a pickle. Hey. Hey. Hey. Hey.";
	next(null, data, params, callback);
};

// Apply the above filters to applicable places in the service.
var filters = {
	find:   { params:[], query:[queryWithUserID], data:[] },
	get:    { query:[queryWithUserID], data:[] },
	create: { beforeData:[dataSetUserID, dataAddNonsense], afterData:[] },
	update: { query:[queryWithUserID], data:[] },
	remove: { query:[queryWithUserID], data:[] }
};
```

It's important to note that the filter middleware functions will be executed in the order in which they appear in the array.

### 3. Create the Service.

```js
// Provide access to the service.
exports.service = new MongooseService(exports.model, filters);
```

## Use the Service

The service is now ready to be used by your feathers app:

```js
var feathers = require('feathers');
var mongoose = require('mongoose');

// Connect to the MongoDB server.
mongoose.connect('mongodb://localhost/feathers-example');

// Bring in service.
var todoService = require('./server/services/todos/service.js').service;

// Create a feathers instance.
var app = feathers();

// Set up public directory
app.use(feathers.static(__dirname + '/public'));

// Register services.
app.use('todos', todoService);

// Start the server.
var port = 80;
app.listen(port, function() {
	console.log('Feathers server listening on port ' + port);
});
```

The above server example doesn't implement authentication, so if you want to test out the above service, empty out the arrays in the filter object before starting your server.

Now you can download the todos example from feathersjs.com and place it in the public directory.  Fire up the server and watch your todos persist in the database.


## API

The default find functionality includes a filter middleware that allows you to use $limit, $skip, and $sort in the query.  These special MongoDB features can be passed directly inside the query object:

```js
// Find all recipes that include salt, limit to 10.
{"ingredients":"salt", "$limit":10} // JSON
GET /todos?%24limit=10&ingredients=salt // REST
```

## Changelog

### 0.0.4
You no longer have to pass in an id on findOne.  If an id is present, the query will be executed as a findById().  All other params will be ignored.  If no id is present, the params.query object will be used in a findOne().

## License

[MIT](LICENSE)

## Author

[Marshall Thompson](https://github.com/Glavin001)

Based on [feathers-mongoose-service](https://github.com/feathersjs/feathers-mongoose-service) by [Glavin Wiechert](https://github.com/Glavin001)
