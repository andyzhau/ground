# Author: Andy Zhao(andy@nodeswork.com)
#
# A sample for how to use it as sails model.
#
#   class YourModel extends GroundModel
#
#     schema:
#       name:    String
#
#   YourModel.sails()

_ = require 'underscore'
async = require 'async'
mongoose = require 'mongoose'
changeCase = require 'change-case'
groundDb = require './ground_db'

__constants =

  # The available lifecycle callback function for sails model.
  LifecycleCallbackFunctionNames: [
    'beforeValidation', 'beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate'
    'beforeDestroy', 'afterDestroy'
  ]

  ExtendFuncs:

    removeMongooseDoc: (cb) ->
      for key in _.keys(values)
        delete @.__sailsDoc[key]
      _.extend @.__sailsDoc, @toObject()
      cb err

    beforeValidation: (cb) -> @validate cb

__constants.ExtendFuncs.beforeCreate = __constants.ExtendFuncs.removeMongooseDoc
__constants.ExtendFuncs.beforeUpdate = __constants.ExtendFuncs.removeMongooseDoc


__helper =

  sailsType: (v) ->
    switch
      when _.isArray v then 'array'
      when not _.isFunction(v) and not v.type? then 'json'
      when v is mongoose.Schema.Types.Mixed then 'json'
      else {}

  sailsSchema: (schema) ->
    _.reduce(schema, ((memo, v, k) -> memo[k] = __helper.sailsType(v); memo), {})


class GroundModel

  # The database name.
  @adapter: 'test'

  # To specify the collection name.  By default, it will translate the model class name to a
  # related collection name.
  @collection: null

  # The schema of the model, using mongoose format.  See the mongoose document for help.
  @schema: {}

  # Sails lifecycle callbacks.  As commented below.
  @callbacks: {}

    # beforeValidation: (cb) ->

    # beforeCreate: (cb) ->

    # afterCreate: (cb) ->

    # beforeUpdate: (cb) ->

    # afterUpdate: (cb) ->

    # beforeDestroy: (cb) ->

    # afterDestroy: (cb) ->

  # The statics function of the model.  'this' will be bound to sails model class.
  @statics:

    validate: (doc, cb) ->
      model = new (@nwmodel.mongooseModel()) doc
      model.validate cb

    findByIds: (ids, cb) ->
      async.series (_.map ids, (id) => (cb) => @findOneById id, cb), cb

  @methods: {}

  # The indexes of the model.
  @indexes: {}

  # Returns the mongoose model interface.
  @mongoose: () ->
    return @__mongooseModel if @__mongooseModel?
    modelPath = @collection ? @__getModelPathFromModelName()
    connection = groundDb.mongooseConnection()
    @__mongooseModel ?= connection.model modelPath, @__mongooseSchema()

  # Returns the sails model interface.
  @sails: ->
    @__sailsModel ?= _.extend {

      # The adapter which appears inside config/adapters.coffee
      adapter: @adapter

      # The attributes of the current model.  Since we are using mongoose to do the validation, so
      # most time, the schema of sails model would be empty, and in schemaless mode.
      attributes: @__sailsAttributes()
      schema: no

      # Same with mongoose table name.
      tableName: @mongoose().collection.name
    }, @__sailsLifecycleCallbacks()

  # Returns the sails attributes.  By using mongoose to do the validation, no need to returns the
  # real attributes.  But will involve some instance methods inside the attributes.
  @__sailsAttributes: ->
    _.extend {},
      @__super__?.constructor?.__sailsAttributes() ? {},
      @__methods(),
      __helper.sailsSchema(@schema)
      ground: @

  # Returns the sails lifecycle callback function for specific callback name.
  @__sailsLifecycleCallback: (callbackName) ->
    return [] unless callbackFunc = @callbacks?[callbackName]
    callbacks = @__super__?.constructor?.__sailsLifecycleCallback(callbackName).slice(0) ? []
    if _.indexOf(superCallback, callbacks) < 0 then callbacks.push callbackFunc
    callbacks

  # Assemble the sails lifecycle callbacks.  All the defined function for super classes would also
  # be called.  The order will be from base class to subclasses.
  @__sailsLifecycleCallbacks: ->
    callbacks = {}
    for functionName in __constants.LifecycleCallbackFunctionNames
      callbackFuncs = @__sailsLifecycleCallback(functionName)
      if __constants.ExtendFuncs[functionName]
        callbackFuncs.push __constants.ExtendFuncs[functionName]
      if callbackFuncs.length is 0
        continue

      do (functionName, callbackFuncs) => callbacks[functionName] = (values, cb) =>
        values.__mongooseDoc ?= new (@mongooseModel())(values)
        values.__mongooseDoc.__sailsDoc ?= values
        async.series (_.bind(func, values.__mongooseDoc) for func in callbackFuncs), cb
    callbacks

  # Returns the nested schema.
  @__schema: -> _.extend {}, @__super__?.constructor?.__schema() ? {}, @schema

  # Returns the nested methods.
  @__methods: -> _.extend {}, @__super__?.constructor?.__methods() ? {}, @methods

  # Returns the nested statics.
  @__statics: -> _.extend {}, @__super__?.constructor?__statics() ? {}, @statics

  # Assemble the NOT cached mongoose schema.
  @__mongooseSchema: ->
    mongooseSchema = new mongoose.Schema @__schema(), _id: no
    _.extend mongooseSchema.methods, @__methods()
    _.extend mongooseSchema.statics, @__statics()
    mongooseSchema

  # Returns the model path from model name.
  #
  # e.g.   class GroupModel -> groups
  #        class UserGroup -> user_groups
  @__getModelPathFromModelName: ->
    modelName = if @name.length > 5 and @name.substring(@name.length - 5) is 'Model'
      @name.substring(0, @name.length - 5)
    else
      @name
    changeCase.snakeCase modelName

module.exports = GroundModel
