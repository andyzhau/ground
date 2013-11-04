var mongodb, mongoose, _, __helper,
  __slice = [].slice;

_ = require('underscore');

mongodb = require('mongodb');

mongoose = require('mongoose');

__helper = {
  options: {
    host: 'localhost',
    port: 27017,
    db: 'test'
  },
  address: function(adapter) {
    var options, sails, _ref, _ref1, _ref2, _ref3;
    sails = require('sails');
    options = (_ref = sails.config.adapters[adapter]) != null ? _ref : {};
    return "mongodb://" + ((_ref1 = options.host) != null ? _ref1 : __helper.options.host) + ":" + ((_ref2 = options.port) != null ? _ref2 : __helper.options.port) + "/" + ((_ref3 = options.db) != null ? _ref3 : __helper.options.database);
  },
  mongooseConnection: function(address, options, cb) {
    return mongoose.createConnection().open(address, cb);
  },
  mongodbConnection: function(address, options, cb) {
    return mongodb.MongoClient.connect(address, cb);
  }
};

module.exports = {
  initialize: function(options) {
    return _.extend(__helper.options, options.db);
  },
  mongooseConnection: function() {
    var adapter, cb, options, _i, _ref;
    adapter = arguments[0], options = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    return __helper.mongooseConnection(__helper.address(adapter), (_ref = options[0]) != null ? _ref : {}, cb);
  },
  mongodbConnection: function() {
    var adapter, cb, options, _i, _ref;
    adapter = arguments[0], options = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
    return __helper.mongodbConnection(__helper.address(adapter), (_ref = options[0]) != null ? _ref : {}, cb);
  }
};
