var GroundModel, async, changeCase, mongodb, mongoose, path, _, __constants,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

async = require('async');

path = require('path');

mongoose = require('mongoose');

changeCase = require('change-case');

mongodb = require('mongodb');

__constants = {
  LifecycleCallbackFunctionNames: ['beforeValidation', 'beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate', 'beforeDestroy', 'afterDestroy'],
  LifecycleFinalCallbackFunctionNames: ['beforeCreate', 'beforeUpdate']
};

GroundModel = (function() {
  function GroundModel() {}

  GroundModel.adapter = 'test';

  GroundModel.collection = null;

  GroundModel.schema = {};

  GroundModel.callbacks = {
    beforeValidation: function(cb) {
      return this.validate(cb);
    }
  };

  GroundModel.statics = {
    validate: function(doc, cb) {
      var model;
      model = new (this.nwmodel.mongooseModel())(doc);
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

  GroundModel.mongooseModel = function() {
    var _base, _base1;
    if ((_base = this.prototype)._mongooseSchema == null) {
      _base._mongooseSchema = this._getMongooseSchema();
    }
    return (_base1 = this.prototype)._mongooseModel != null ? (_base1 = this.prototype)._mongooseModel : _base1._mongooseModel = this._getMongooseModel();
  };

  GroundModel.sailsModel = function() {
    var _base;
    return (_base = this.prototype)._sailsModel != null ? (_base = this.prototype)._sailsModel : _base._sailsModel = _.extend({
      adapter: this.prototype.adapter,
      attributes: this._getSailsAttributes(),
      schema: false,
      tableName: this.getCollectionName()
    }, this._getSailsLifecycleCallbacks());
  };

  GroundModel.__collectionName = function() {
    return this.mongooseModel().collection.name;
  };

  GroundModel.__getSailsAttributes = function() {
    var fetchSailsType, _ref, _ref1;
    fetchSailsType = function(v) {
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
    };
    return _.extend(((_ref = this.__super__) != null ? (_ref1 = _ref.constructor) != null ? _ref1._getSailsAttributes() : void 0 : void 0) || {}, this.prototype.methods, _.reduce(this.prototype.schema, (function(memo, v, k) {
      memo[k] = fetchSailsType(v);
      return memo;
    }), {}), {
      nwmodel: this
    });
  };

  GroundModel.__getSailsLifecycleCallback = function(callbackName) {
    var callbackFunc, superCallback, _ref, _ref1, _ref2;
    if (this === NWModel) {
      return [];
    }
    if (!(callbackFunc = (_ref = this.prototype.callbacks) != null ? _ref[callbackName] : void 0)) {
      return [];
    }
    superCallback = ((_ref1 = this.__super__) != null ? (_ref2 = _ref1.constructor) != null ? _ref2._getSailsLifecycleCallback(callbackName) : void 0 : void 0) || [];
    if (_.indexOf(superCallback, callbackFunc) < 0) {
      superCallback.push(callbackFunc);
    }
    return superCallback;
  };

  GroundModel.__getSailsLifecycleCallbacks = function() {
    var callbackFuncs, callbacks, functionName, _fn, _i, _len,
      _this = this;
    callbacks = {};
    _fn = function(functionName, callbackFuncs) {
      return callbacks[functionName] = function(values, cb) {
        var func, onDone;
        onDone = function(err) {
          var key, _j, _len1, _ref;
          if (__indexOf.call(LifecycleFinalCallbackFunctionNames, functionName) >= 0 && (values._mongooseDoc != null)) {
            _ref = _.keys(values);
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              key = _ref[_j];
              if (key !== '_mongooseDoc') {
                delete values[key];
              }
            }
            _.extend(values, values._mongooseDoc.toObject());
            delete values._mongooseDoc;
          }
          return cb(err);
        };
        if (values._mongooseDoc == null) {
          values._mongooseDoc = new (_this.mongooseModel())(values);
        }
        return async.series((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = callbackFuncs.length; _j < _len1; _j++) {
            func = callbackFuncs[_j];
            _results.push(_.bind(func, values._mongooseDoc));
          }
          return _results;
        })(), onDone);
      };
    };
    for (_i = 0, _len = LifecycleCallbackFunctionNames.length; _i < _len; _i++) {
      functionName = LifecycleCallbackFunctionNames[_i];
      callbackFuncs = this._getSailsLifecycleCallback(functionName).concat(NWModel.prototype.callbacks[functionName] || []);
      if (!(callbackFuncs.length !== 0 || __indexOf.call(LifecycleFinalCallbackFunctionNames, functionName) >= 0)) {
        continue;
      }
      _fn(functionName, callbackFuncs);
    }
    return callbacks;
  };

  GroundModel.__getSchema = function() {
    var _ref, _ref1;
    return _.extend(((_ref = this.__super__) != null ? (_ref1 = _ref.constructor) != null ? _ref1._getSchema() : void 0 : void 0) || {}, this.prototype.schema);
  };

  GroundModel.__getMethods = function() {
    var _ref, _ref1;
    return _.extend(((_ref = this.__super__) != null ? (_ref1 = _ref.constructor) != null ? _ref1._getMethods() : void 0 : void 0) || {}, this.prototype.methods);
  };

  GroundModel.__getStatics = function() {
    var _ref, _ref1;
    return _.extend(((_ref = this.__super__) != null ? (_ref1 = _ref.constructor) != null ? _ref1.getStatics() : void 0 : void 0) || {}, this.prototype.statics);
  };

  GroundModel.__getMongooseSchema = function() {
    var mongooseSchema;
    mongooseSchema = new mongoose.Schema(this._getSchema(), {
      _id: false
    });
    _.extend(mongooseSchema.methods, this._getMethods());
    _.extend(mongooseSchema.statics, this.getStatics());
    return mongooseSchema;
  };

  GroundModel.__getMongooseModel = function() {
    var connection, modelPath;
    modelPath = this.prototype.collection || this._getModelPathFromModelName();
    connection = this._connection();
    return connection.model(modelPath, this.prototype._mongooseSchema);
  };

  GroundModel.__connection = function() {
    return getMongooseDBConnection(this.prototype.adapter);
  };

  GroundModel.__db = function(cb) {
    return getMongoDB(this.prototype.adapter, cb);
  };

  GroundModel.__getModelPathFromModelName = function() {
    var modelName;
    modelName = this.name.length > 5 && this.name.substring(this.name.length - 5) === 'Model' ? this.name.substring(0, this.name.length - 5) : this.name;
    return changeCase.snakeCase(modelName);
  };

  return GroundModel;

})();
