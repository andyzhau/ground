var GroundRoutes, _;

_ = require('underscore');

GroundRoutes = (function() {
  function GroundRoutes() {}

  GroundRoutes.prefix = '';

  GroundRoutes.routes = {};

  GroundRoutes.asRoutes = {};

  GroundRoutes.paths = {};

  GroundRoutes.bindReq = function(req) {
    req.paths = Object.create({}, this.pathPrototype());
    return req.paths.req = req;
  };

  GroundRoutes.pathPrototype = function() {
    var _this = this;
    return this._pathPrototype != null ? this._pathPrototype : this._pathPrototype = (function() {
      var key, res, val, _fn, _ref;
      res = {};
      _ref = _this.asRoutes;
      _fn = function(val) {
        return res[key] = {
          get: function() {
            var _this = this;
            return val.replace(/:([\w\d_-]+)/g, function(match, p1) {
              if (_this.req.params[p1] == null) {
                throw new Error("param '" + p1 + "' not found.");
              }
              return _this.req.params[p1];
            });
          }
        };
      };
      for (key in _ref) {
        val = _ref[key];
        _fn(val);
      }
      return res;
    })();
  };

  GroundRoutes.sails = function() {
    var emit, generateRoute, result,
      _this = this;
    result = {};
    emit = function(prefix, route, config) {
      var actions, as, bindPath, routePaths;
      routePaths = route.split(' ');
      bindPath = prefix + _.last(routePaths);
      if (bindPath.length > 1 && _.last(bindPath) === '/') {
        bindPath = bindPath.substring(0, bindPath.length - 1);
      }
      routePaths[routePaths.length - 1] = bindPath;
      if (config.as != null) {
        _this.asRoutes[config.as] = bindPath;
        as = config.as;
        (function(as) {
          return _this.paths[as] = function(params) {
            var _this = this;
            return this.asRoutes[as].replace(/:([\w\d_-]+)/g, function(match, p1) {
              if (params[p1] == null) {
                throw new Error("param '" + p1 + "' not found.");
              }
              return params[p1];
            });
          };
        })(as);
        delete config.as;
      }
      if (config.action != null) {
        actions = config.action.split('.');
        if (actions.length != null) {
          config = _.compact((config.controller || '').split('.').concat(actions)).join('.');
        }
      }
      if (config.controller != null) {
        config = config.controller;
      }
      return result[routePaths.join(' ')] = config;
    };
    generateRoute = function(routes, prefix) {
      var key, val, _results;
      if (prefix == null) {
        prefix = '';
      }
      if (!_.isObject(routes)) {
        return;
      }
      _results = [];
      for (key in routes) {
        val = routes[key];
        switch (false) {
          case !_.isString(val):
            _results.push(emit(prefix, key, val));
            break;
          case !(_.isObject(val) && ((val.controller != null) || (val.view != null) || (val.action != null))):
            _results.push(emit(prefix, key, val));
            break;
          case !_.isObject(val):
            _results.push(generateRoute(val, prefix + key));
            break;
          default:
            _results.push(void 0);
        }
      }
      return _results;
    };
    generateRoute(this.routes, this.prefix);
    return result;
  };

  return GroundRoutes;

})();

module.exports = GroundRoutes;
