# Author: andyzhau@nodeswork.com (Andy Zhau)

fs = require 'fs'
mongodb = require 'mongodb'
GroundModel = require './GroundModel'

class GroundFileModel extends GroundModel

  @collection: 'fs.files'

  @methods:

    read: (options..., cb) ->
      @ground._db (err, db) =>
        mongodb.GridStore.read db, new mongodb.ObjectID(@id), cb

  @statics:

    # options:
    #   id: fileId
    writeFile: (file, options..., cb) ->
      options = options[0] ? {}
      options.id ?= new mongodb.ObjectID()
      @ground._db (err, db) ->
        gridStore = new mongodb.GridStore(db, options.id, 'w')
        gridStore.writeFile file, (err, gridStore) ->
          if err? then cb err
          else gridStore.close cb

    writeBuffer: (buf, options..., cb) ->
      options = options[0] ? {}
      options.id ?= new mongodb.ObjectID()
      @ground._db (err, db) ->
        gridStore = new mongodb.GridStore(db, options.id, 'w')
        gridStore.open ->
          gridStore.write buf, ->
            gridStore.close cb

module.exports = GroundFileModel
