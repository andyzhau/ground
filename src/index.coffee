# Author: andyzhau@nodeswork.com (Andy Zhau)

groundDb = require './ground/ground_db'

module.exports = Object.create {
  initialize: (options) ->
    groundDb.initialize options
}, {
  GroundModel: get: -> require './ground/GroundModel'
}
