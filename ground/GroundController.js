var GroundController, _, __constants, __helper,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

__constants = {
  AvoidKeys: ['constructor']
};

__helper = {
  room: function(path) {
    return "room:" + path;
  },
  broadcast: function(path, uri, data) {
    var message, room;
    room = __helper.room(path);
    message = {
      uri: uri,
      data: data
    };
    return sails.io.sockets["in"](room).json.send(message);
  }
};

GroundController = (function() {
  function GroundController(req, res) {
    this.req = req;
    this.res = res;
  }

  GroundController.prototype.listen = function(path) {
    return this.req.listen(__helper.room(path));
  };

  GroundController.prototype.broadcast = function(path, uri, data, options) {
    if (options == null) {
      options = {};
    }
    if ((this.res.broadcast != null) && options.exclude) {
      return this.res.broadcast(__helper.room(path), {
        uri: uri,
        data: data
      });
    } else {
      return __helper.broadcast(path, uri, data);
    }
  };

  GroundController.sailsController = function() {
    var controller, func, key, _fn, _ref,
      _this = this;
    controller = {};
    _ref = this.prototype;
    _fn = function(key) {
      return controller[key] = _.wrap(func, function(realFunc, req, res) {
        var ctrl;
        ctrl = new _this(req, res);
        return ctrl[key]();
      });
    };
    for (key in _ref) {
      func = _ref[key];
      if (__indexOf.call(__constants.AvoidKeys, key) >= 0) {
        continue;
      }
      _fn(key);
    }
    return controller;
  };

  return GroundController;

})();

module.exports = GroundController;
