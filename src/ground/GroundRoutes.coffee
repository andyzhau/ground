# Author: Andy Zhao(andy@nodeswork.com)

_ = require 'underscore'

class GroundRoutes

  @prefix: ''

  @routes: {}

  @asRoutes: {}

  @paths: {}

  @bindReq: (req) ->
    req.paths = Object.create {}, @pathPrototype()
    req.paths.req = req

  @pathPrototype: () ->
    @_pathPrototype ?= do ->
      res = {}
      for key, val of NWRoutes.asRoutes
        do (val) ->
          res[key] = get: ->
            val.replace /:([\w\d_-]+)/g, (match, p1) =>
              unless @req.params[p1]? then throw new Error "param '#{p1}' not found."
              @req.params[p1]
      res

  @sailsRoutes: ->
    result = {}

    emit = (prefix, route, config) =>
      routePaths = route.split ' '
      bindPath = prefix + _.last routePaths
      if bindPath.length > 1 and _.last(bindPath) is '/'
        bindPath = bindPath.substring(0, bindPath.length - 1)
      routePaths[routePaths.length - 1] = bindPath
      if config.as?
        NWRoutes.asRoutes[config.as] = bindPath
        as = config.as
        do (as) =>
          @paths[as] = (params) ->
            NWRoutes.asRoutes[as].replace /:([\w\d_-]+)/g, (match, p1) =>
              unless params[p1]? then throw new Error "param '#{p1}' not found."
              params[p1]
        delete config.as

      if config.action?
        actions = config.action.split '.'
        if actions.length?
          config = _.compact((config.controller || '').split('.').concat(actions)).join('.')
      if config.controller?
        config = config.controller
      result[routePaths.join ' '] = config

    generateRoute = (routes, prefix='') ->
      return unless _.isObject(routes)
      for key, val of routes
        switch
          when _.isString(val) then emit prefix, key, val
          when _.isObject(val) and (val.controller? or val.view? or val.action?)
            emit prefix, key, val
          when _.isObject val then generateRoute val, prefix + key

    generateRoute @routes, @prefix

    result

module.exports = GroundRoutes
