var GroundFileModel, GroundModel, fs, mongodb, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

fs = require('fs');

mongodb = require('mongodb');

GroundModel = require('./GroundModel');

GroundFileModel = (function(_super) {
  __extends(GroundFileModel, _super);

  function GroundFileModel() {
    _ref = GroundFileModel.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  GroundFileModel.collection = 'fs.files';

  GroundFileModel.methods = {
    read: function() {
      var cb, options, _i,
        _this = this;
      options = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
      return this.ground._db(function(err, db) {
        return mongodb.GridStore.read(db, new mongodb.ObjectID(_this.id), cb);
      });
    }
  };

  GroundFileModel.statics = {
    writeFile: function() {
      var cb, file, options, _i, _ref1;
      file = arguments[0], options = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
      options = (_ref1 = options[0]) != null ? _ref1 : {};
      if (options.id == null) {
        options.id = new mongodb.ObjectID();
      }
      return this.ground._db(function(err, db) {
        var gridStore;
        gridStore = new mongodb.GridStore(db, options.id, 'w');
        return gridStore.writeFile(file, function(err, gridStore) {
          if (err != null) {
            return cb(err);
          } else {
            return gridStore.close(cb);
          }
        });
      });
    },
    writeBuffer: function() {
      var buf, cb, options, _i, _ref1;
      buf = arguments[0], options = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), cb = arguments[_i++];
      options = (_ref1 = options[0]) != null ? _ref1 : {};
      if (options.id == null) {
        options.id = new mongodb.ObjectID();
      }
      return this.ground._db(function(err, db) {
        var gridStore;
        gridStore = new mongodb.GridStore(db, options.id, 'w');
        return gridStore.open(function() {
          return gridStore.write(buf, function() {
            return gridStore.close(cb);
          });
        });
      });
    }
  };

  return GroundFileModel;

})(GroundModel);

module.exports = GroundFileModel;
