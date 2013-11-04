# Author: Andy Zhao(andy@nodeswork.com)

_ = require 'underscore'

class GroundPolicy

  @sails: ->
    policies = {}

    emit = (controller, key, values) ->
      if _.isArray values
        values = _.flatten _.map(_.flatten(values), (v) -> v.split(' ')), true
      if controller? then policy = (policies[controller] ?= {})
      else policy = policies
      policy[key] ?= []
      _.each values, (value) ->
        unless value in policy[key] then policy[key].push value

    nestedPolicy = (policy, controller, policies=[], underNamespace=no) ->
      policies = _.clone policies
      if policy['*']? then policies.push policy['*']
      unless underNamespace then emit controller, '*', policies
      for key, val of policy
        nxtController = if _.endsWith key, 'Controller' then key else controller
        switch
          when _.isFunction val then continue
          when key is '*' then continue
          when _.isObject(val) and not _.isArray(val)
            nestedPolicy val, nxtController, policies, not _.endsWith key, 'Controller'
          when key is ':actions'
            if _.isString val then val = val.split(' ')
            _.each val, (action) -> emit controller, action, policies
          when val is yes and _.endsWith(key, 'Controller')
            emit nxtController, '*', policies
          when val is yes
            emit nxtController, key, policies
          else emit controller, key, policies.concat [val]

    nestedPolicy @prototype
    policies

module.exports = GroundPolicy
