# Author: andyzhau@nodeswork.com (Andy Zhau)

Object.create {}, {

  GroundModel:
    get: ->
      require './ground/sails/GroundModel'
}
