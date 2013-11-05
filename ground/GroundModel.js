var GroundModel, async, changeCase, groundDb, mongoose, _, __constants, __helper;

_ = require('underscore');

async = require('async');

mongoose = require('mongoose');

changeCase = require('change-case');

groundDb = require('./ground_db');

__constants = {
  LifecycleCallbackFunctionNames: ['beforeValidation', 'beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate', 'beforeDestroy', 'afterDestroy'],
  ExtendFuncs: {
    removeMongooseDoc: function(cb) {
      var key, sailsDoc, _i, _len, _ref;
      sailsDoc = this.__sailsDoc;
      _ref = _.keys(sailsDoc);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        delete sailsDoc[key];
      }
      delete this.__sailsDoc;
      _.extend(sailsDoc, this.toObject());
      return cb(null);
    },
    beforeValidation: function(cb) {
      return this.validate(cb);
    }
  }
};

__constants.ExtendFuncs.beforeCreate = __constants.ExtendFuncs.removeMongooseDoc;

__constants.ExtendFuncs.beforeUpdate = __constants.ExtendFuncs.removeMongooseDoc;

__helper = {
  sailsType: function(v) {
    switch (false) {
      case !_.isArray(v):
        return 'array';
      case !(!_.isFunction(v) && (v.type == null)):
        return 'json';
      case v !== mongoose.Schema.Types.Mixed:
        return 'json';
      default:
        return {};
    }
  },
  sailsSchema: function(schema) {
    return _.reduce(schema, (function(memo, v, k) {
      memo[k] = __helper.sailsType(v);
      return memo;
    }), {});
  }
};

GroundModel = (function() {
  function GroundModel() {}

  GroundModel.adapter = 'test';

  GroundModel.collection = null;

  GroundModel.schema = {};

  GroundModel.callbacks = {};

  GroundModel.statics = {
    validate: function(doc, cb) {
      var model;
      model = new (this.ground.mongoose())(doc);
      return model.validate(cb);
    },
    findByIds: function(ids, cb) {
      var _this = this;
      return async.series(_.map(ids, function(id) {
        return function(cb) {
          return _this.findOneById(id, cb);
        };
      }), cb);
    }
  };

  GroundModel.methods = {};

  GroundModel.indexes = {};

  GroundModel.mongoose = function() {
    var connection, modelPath, _ref;
    if (this.__mongooseModel != null) {
      return this.__mongooseModel;
    }
    modelPath = (_ref = this.collection) != null ? _ref : this.__getModelPathFromModelName();
    connection = groundDb.mongooseConnection(this.adapter);
    return this.__mongooseModel != null ? this.__mongooseModel : this.__mongooseModel = connection.model(modelPath, this.__mongooseSchema());
  };

  GroundModel.sails = function() {
    return this.__sailsModel != null ? this.__sailsModel : this.__sailsModel = _.extend({
      adapter: this.adapter,
      attributes: this.__sailsAttributes(),
      schema: false,
      tableName: this.mongoose().collection.name
    }, this.__sailsLifecycleCallbacks());
  };

  GroundModel.__sailsAttributes = function() {
    var _ref, _ref1, _ref2;
    return _.extend({}, (_ref = (_ref1 = this.__super__) != null ? (_ref2 = _ref1.constructor) != null ? _ref2.__sailsAttributes() : void 0 : void 0) != null ? _ref : {}, this.__methods(), __helper.sailsSchema(this.schema), {
      ground: this
    });
  };

  GroundModel.__sailsLifecycleCallback = function(callbackName) {
    var callbackFunc, callbacks, _ref, _ref1, _ref2, _ref3;
    if (!(callbackFunc = (_ref = this.callbacks) != null ? _ref[callbackName] : void 0)) {
      return [];
    }
    callbacks = (_ref1 = (_ref2 = this.__super__) != null ? (_ref3 = _ref2.constructor) != null ? _ref3.__sailsLifecycleCallback(callbackName).slice(0) : void 0 : void 0) != null ? _ref1 : [];
    if (_.indexOf(callbacks, callbackFunc) < 0) {
      callbacks.push(callbackFunc);
    }
    return callbacks;
  };

  GroundModel.__sailsLifecycleCallbacks = function() {
    var callbackFuncs, callbacks, functionName, _fn, _i, _len, _ref,
      _this = this;
    callbacks = {};
    _ref = __constants.LifecycleCallbackFunctionNames;
    _fn = function(functionName, callbackFuncs) {
      return callbacks[functionName] = function(values, cb) {
        var func, _base;
        if (values.__mongooseDoc == null) {
          values.__mongooseDoc = new (_this.mongoose())(values);
        }
        if ((_base = values.__mongooseDoc).__sailsDoc == null) {
          _base.__sailsDoc = values;
        }
        return async.series((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = callbackFuncs.length; _j < _len1; _j++) {
            func = callbackFuncs[_j];
            _results.push(_.bind(func, values.__mongooseDoc));
          }
          return _results;
        })(), function(err) {
          return cb(err);
        });
      };
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      functionName = _ref[_i];
      callbackFuncs = this.__sailsLifecycleCallback(functionName);
      if (__constants.ExtendFuncs[functionName]) {
        callbackFuncs.push(__constants.ExtendFuncs[functionName]);
      }
      if (callbackFuncs.length === 0) {
        continue;
      }
      _fn(functionName, callbackFuncs);
    }
    return callbacks;
  };

  GroundModel.__schema = function() {
    var _ref, _ref1, _ref2;
    return _.extend({}, (_ref = (_ref1 = this.__super__) != null ? (_ref2 = _ref1.constructor) != null ? _ref2.__schema() : void 0 : void 0) != null ? _ref : {}, this.schema);
  };

  GroundModel.__methods = function() {
    var _ref, _ref1, _ref2;
    return _.extend({}, (_ref = (_ref1 = this.__super__) != null ? (_ref2 = _ref1.constructor) != null ? _ref2.__methods() : void 0 : void 0) != null ? _ref : {}, this.methods);
  };

  GroundModel.__statics = function() {
    var _ref, _ref1, _ref2;
    return _.extend({}, (_ref = (_ref1 = this.__super__) != null ? (_ref2 = _ref1.constructor) != null ? _ref2.__statics() : void 0 : void 0) != null ? _ref : {}, this.statics);
  };

  GroundModel.__mongooseSchema = function() {
    var mongooseSchema;
    mongooseSchema = new mongoose.Schema(this.__schema(), {
      _id: false
    });
    _.extend(mongooseSchema.methods, this.__methods());
    _.extend(mongooseSchema.statics, this.__statics());
    return mongooseSchema;
  };

  GroundModel.__getModelPathFromModelName = function() {
    var modelName;
    modelName = this.name.length > 5 && this.name.substring(this.name.length - 5) === 'Model' ? this.name.substring(0, this.name.length - 5) : this.name;
    return changeCase.snakeCase(modelName);
  };

  return GroundModel;

})();

module.exports = GroundModel;
