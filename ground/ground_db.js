var mongodb, mongoose, _, __helper;

_ = require('underscore');

mongodb = require('mongodb');

mongoose = require('mongoose');

__helper = {
  options: {
    host: 'localhost',
    port: 27017,
    db: 'test'
  },
  address: function(options) {
    var _ref, _ref1, _ref2;
    return "mongodb://" + ((_ref = options.host) != null ? _ref : __helper.options.host) + ":" + ((_ref1 = options.port) != null ? _ref1 : __helper.options.port) + "/" + ((_ref2 = options.db) != null ? _ref2 : __helper.options.db);
  },
  mongooseConnection: _.memoize(function(address, options, cb) {
    return mongoose.createConnection().open(address, cb);
  }),
  mongodbConnection: _.memoize(function(address, options, cb) {
    return mongodb.MongoClient.connect(address, cb);
  })
};

module.exports = {
  initialize: function(options) {
    return _.extend(__helper.options, options.db);
  },
  mongooseConnection: function(options, cb) {
    return __helper.mongooseConnection(__helper.address(options), options, cb);
  },
  mongodbConnection: function(options, cb) {
    return __helper.mongodbConnection(__helper.address(options), options, cb);
  }
};
