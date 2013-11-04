# Author: andyzhau@nodeswork.com (Andy Zhau)

_ = require 'underscore'
mongodb = require 'mongodb'
mongoose = require 'mongoose'

__helper =

  options:
    host: 'localhost'
    port: 27017
    db: 'test'

  address: (adapter) ->
    sails = require 'sails'
    options = sails.config.adapters[adapter] ? {}
    "mongodb://#{options.host ? __helper.options.host}:#{options.port ? __helper.options.port}/#{options.db ? __helper.options.database}"

  mongooseConnection: (address, options, cb) ->
    mongoose.createConnection().open address, cb

  mongodbConnection: (address, options, cb) ->
    mongodb.MongoClient.connect address, cb


module.exports =

  initialize: (options) ->
    _.extend __helper.options, options.db

  # cb (err, connection)
  mongooseConnection: (adapter, options..., cb) ->
    __helper.mongooseConnection __helper.address(adapter), options[0] ? {}, cb

  # cb (err, db)
  mongodbConnection: (adapter, options..., cb) ->
    __helper.mongodbConnection __helper.address(adapter), options[0] ? {}, cb
