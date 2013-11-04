# Author: andyzhau@nodeswork.com (Andy Zhau)

groundDb = require './ground/ground_db'

module.exports = Object.create {
  initialize: (options) ->
    groundDb.initialize options
}, {
  GroundController: get: -> require './ground/GroundController'
  GroundFileModel: get: -> require './ground/GroundFileModel'
  GroundModel: get: -> require './ground/GroundModel'
  GroundPolicy: get: -> require './ground/GroundPolicy'
  GroundRoutes: get: -> require './ground/GroundRoutes'
}
