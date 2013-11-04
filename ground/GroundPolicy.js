var GroundPolicy, _, __helper,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('underscore');

__helper = {
  isControllerClass: function(name) {
    return name.length >= 10 && name.substring(name.length - 10) === 'Controller';
  }
};

GroundPolicy = (function() {
  function GroundPolicy() {}

  GroundPolicy.sails = function() {
    var emit, nestedPolicy, policies;
    policies = {};
    emit = function(controller, key, values) {
      var policy;
      if (_.isArray(values)) {
        values = _.flatten(_.map(_.flatten(values), function(v) {
          return v.split(' ');
        }), true);
      }
      if (controller != null) {
        policy = (policies[controller] != null ? policies[controller] : policies[controller] = {});
      } else {
        policy = policies;
      }
      if (policy[key] == null) {
        policy[key] = [];
      }
      return _.each(values, function(value) {
        if (__indexOf.call(policy[key], value) < 0) {
          return policy[key].push(value);
        }
      });
    };
    nestedPolicy = function(policy, controller, policies, underNamespace) {
      var key, nxtController, val, _results;
      if (policies == null) {
        policies = [];
      }
      if (underNamespace == null) {
        underNamespace = false;
      }
      policies = _.clone(policies);
      if (policy['*'] != null) {
        policies.push(policy['*']);
      }
      if (!underNamespace) {
        emit(controller, '*', policies);
      }
      _results = [];
      for (key in policy) {
        val = policy[key];
        nxtController = __helper.isControllerClass(key) ? key : controller;
        switch (false) {
          case !_.isFunction(val):
            continue;
          case key !== '*':
            continue;
          case !(_.isObject(val) && !_.isArray(val)):
            _results.push(nestedPolicy(val, nxtController, policies, !__helper.isControllerClass(key)));
            break;
          case key !== ':actions':
            if (_.isString(val)) {
              val = val.split(' ');
            }
            _results.push(_.each(val, function(action) {
              return emit(controller, action, policies);
            }));
            break;
          case !(val === true && _.endsWith(key, 'Controller')):
            _results.push(emit(nxtController, '*', policies));
            break;
          case val !== true:
            _results.push(emit(nxtController, key, policies));
            break;
          default:
            _results.push(emit(controller, key, policies.concat([val])));
        }
      }
      return _results;
    };
    nestedPolicy(this.prototype);
    return policies;
  };

  return GroundPolicy;

})();

module.exports = GroundPolicy;
