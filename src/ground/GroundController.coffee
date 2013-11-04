# Copyright 2013 Nodeswork Inc. All Rights Reserved.
# Author: Andy Zhao(andy@nodeswork.com)

_ = require 'underscore'

__constants =

  AvoidKeys: ['constructor']


__helper =

  room: (path) -> "room:#{path}"

  broadcast: (path, uri, data) ->
    room = __helper.room path
    message = uri: uri, data: data
    sails.io.sockets.in(room).json.send(message)


class GroundController

  constructor: (@req, @res) ->

  listen: (path) ->
    @req.listen __helper.room path

  broadcast: (path, uri, data, options={}) ->
    if @res.broadcast? and options.exclude
      @res.broadcast(__helper.room(path), uri: uri, data: data)
    else __helper.broadcast(path, uri, data)

  @sails: ->
    controller = {}
    for key, func of @prototype
      if key in __constants.AvoidKeys then continue
      do (key) =>
        controller[key] = _.wrap func, (realFunc, req, res) =>
          ctrl = new @(req, res)
          ctrl[key]()
    controller

module.exports = GroundController
