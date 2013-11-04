# Author: andyzhau@nodeswork.com (Andy Zhau)

_ = require 'underscore'
mongodb = require 'mongodb'
mongoose = require 'mongoose'

__helper =

  options:
    host: 'localhost'
    port: 27017
    db: 'test'

  address: (options) ->
    "mongodb://#{options.host ? __helper.options.host}:#{options.port ? __helper.options.port}/#{options.db ? __helper.options.db}"

  mongooseConnection: _.memoize (address, options, cb) ->
    mongoose.createConnection().open address, cb

  mongodbConnection: _.memoize (address, options, cb) ->
    mongodb.MongoClient.connect address, cb


module.exports =

  initialize: (options) ->
    _.extend __helper.options, options.db

  # cb (err, connection)
  mongooseConnection: (options, cb) ->
    __helper.mongooseConnection __helper.address(options), options, cb

  # cb (err, db)
  mongodbConnection: (options, cb) ->
    __helper.mongodbConnection __helper.address(options), options, cb
