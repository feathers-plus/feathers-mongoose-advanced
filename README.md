feathers-mongoose-advanced
================

> __This project is no longer maintained. Use [feathers-mongoose](https://github.com/feathersjs-ecosystem/feathers-mongoose/) instead__

> Create a [Mongoose](http://mongoosejs.com/) ORM wrapped service for [FeathersJS](https://github.com/feathersjs).

This Feathers service adapter is the same as the `feathers-mongoose` adapter, but includes optimizations for handling bulk insertion of data.
With the current feathers-mongoose adapter, when you pass 100 items to `create` and 1 or more have errors either with validation or write errors (duplicate `_id`) you will only get back the first error and this will throw and skip any after hooks.
This plugin returns a success response when a record is inserted, but pushes errored records into
`params.errors[]`.  You can handle those in an after hook at `hook.params.errors`. Even with errors, the after hooks will be run as all the items with errors will be present in `params.errors[]`.

**This adapter drops support for Node.js V4.**

## Installation

```bash
npm install feathers-mongoose-advanced --save
```

## Documentation

Please refer to the [Feathers database adapter documentation](http://docs.feathersjs.com/databases/readme.html) for more details or directly at:

- [Mongoose](http://docs.feathersjs.com/databases/mongoose.html) - The detailed documentation for this adapter
- [Extending](http://docs.feathersjs.com/databases/extending.html) - How to extend a database adapter
- [Pagination and Sorting](http://docs.feathersjs.com/databases/pagination.html) - How to use pagination and sorting for the database adapter
- [Querying](http://docs.feathersjs.com/databases/querying.html) - The common adapter querying mechanism

## Getting Started

Creating an Mongoose service is this simple (make sure your MongoDB server is up and running):

```js
var mongoose = require('mongoose');
var MongooseModel = require('./models/mymodel')
var mongooseService = require('feathers-mongoose-advanced');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

app.use('/todos', mongooseService({
  Model: MongooseModel
}));
```

See the [Mongoose Guide](http://mongoosejs.com/docs/guide.html) for more information on defining your model.

### Complete Example

Here's a complete example of a Feathers server with a `message` mongoose-service.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const errors = require('feathers-errors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const service = require('feathers-mongoose-advanced');

// Require your models
const Message = require('./models/message');

// Tell mongoose to use native promises
// See http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

// Connect to your MongoDB instance(s)
mongoose.connect('mongodb://localhost:27017/feathers');


// Create a feathers instance.
const app = feathers()
  // Enable Socket.io
  .configure(socketio())
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

// Connect to the db, create and register a Feathers service.
app.use('messages', service({,
  Model: Message,
  paginate: {
    default: 2,
    max: 4
  }
}));

// A basic error handler, just like Express
app.use(errors.handler());

app.listen(3030);
console.log('Feathers Message mongoose service running on 127.0.0.1:3030');
```

You can run this example by using `npm start` and going to [localhost:3030/messages](http://localhost:3030/messages). You should see an empty array. That's because you don't have any messages yet but you now have full CRUD for your new message service, including mongoose validations!

## License

[MIT](LICENSE)

## Authors

- [Feathers contributors](https://github.com/feathers-plus/feathers-mongoose-advanced/graphs/contributors)
