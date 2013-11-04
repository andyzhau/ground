# Author: Andy Zhao(andy@nodeswork.com)
#
# A sample for how to use it as sails model.
#
#   class YourModel extends NWModel
#
#     schema:
#       name:    String
#
#   YourModel.sailsModel()

_ = require 'underscore'
async = require 'async'
path = require 'path'
mongoose = require 'mongoose'
changeCase = require 'change-case'
mongodb = require 'mongodb'

__constants =

  # The available lifecycle callback function for sails model.
  LifecycleCallbackFunctionNames: [
    'beforeValidation', 'beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate'
    'beforeDestroy', 'afterDestroy'
  ]

  # Two final callback functions from sails model for 'create' and 'update'.
  LifecycleFinalCallbackFunctionNames: [
    'beforeCreate', 'beforeUpdate'
  ]

class GroundModel

  # The database where the doc save.  Change to the adapter name under config/adapter.coffee.
  # By default it saves to nodeswork database.
  adapter: 'nodeswork'

  # To specify the collection name.  By default, it will translate the model class name to a
  # related collection name.
  collection: undefined

  # The schema of the model.  See the mongoose document for help.
  schema: {}

  # Sails lifecycle callbacks.  As commented below.
  callbacks:

    beforeValidation: (cb) ->
      @validate cb

    # beforeCreate: (cb) ->

    # afterCreate: (cb) ->

    # beforeUpdate: (cb) ->

    # afterUpdate: (cb) ->

    # beforeDestroy: (cb) ->

    # afterDestroy: (cb) ->

  # The statics function of the model.  'this' will be bound to sails model class.
  statics:

    validate: (doc, cb) ->
      model = new (@nwmodel.mongooseModel()) doc
      model.validate cb

    findByIds: (ids, cb) ->
      async.series (_.map ids, (id) => (cb) => @findOneById id, cb), cb

  methods: {}

  # The indexes of the model.
  indexes: {}

  # Returns the mongoose model interface.
  @mongooseModel: ->
    @prototype._mongooseSchema ?= @_getMongooseSchema()
    @prototype._mongooseModel ?= @_getMongooseModel()

  # Returns the collection name.
  @getCollectionName: -> @mongooseModel().collection.name

  # Returns the sails model interface.
  @sailsModel: ->
    @prototype._sailsModel ?= _.extend {

      # The adapter which appears inside config/adapters.coffee
      adapter: @prototype.adapter

      # The attributes of the current model.  Since we are using mongoose to do the validation, so
      # most time, the schema of sails model would be empty, and in schemaless mode.
      attributes: @_getSailsAttributes()
      schema: no

      # Same with mongoose table name.
      tableName: @getCollectionName()
    }, @_getSailsLifecycleCallbacks()

  # Returns the sails attributes.  By using mongoose to do the validation, no need to returns the
  # real attributes.  But will involve some instance methods inside the attributes.
  @_getSailsAttributes: ->
    fetchSailsType = (v) ->
      switch
        when _.isArray v then 'array'
        when not _.isFunction(v) and not v.type? then 'json'
        when v is mongoose.Schema.Types.Mixed then 'json'
        else {}
    _.extend (@__super__?.constructor?._getSailsAttributes() || {}), @prototype.methods,
      _.reduce(@prototype.schema, ((memo, v, k) -> memo[k] = fetchSailsType v; memo), {}),
      # Public the nwmodel for reference.
      nwmodel: @

  # Returns the sails lifecycle callback function for specific callback name.
  @_getSailsLifecycleCallback: (callbackName) ->
    if @ is NWModel then return []
    return [] unless callbackFunc = @prototype.callbacks?[callbackName]
    superCallback = @__super__?.constructor?._getSailsLifecycleCallback(callbackName) || []
    if _.indexOf(superCallback, callbackFunc) < 0 then superCallback.push callbackFunc
    superCallback

  # Assemble the sails lifecycle callbacks.  All the defined function for super classes would also
  # be called.  The order will be from base class to subclasses.
  @_getSailsLifecycleCallbacks: ->
    callbacks = {}
    for functionName in LifecycleCallbackFunctionNames
      callbackFuncs = @_getSailsLifecycleCallback(functionName).concat(
        NWModel.prototype.callbacks[functionName] || [])

      unless callbackFuncs.length isnt 0 or functionName in LifecycleFinalCallbackFunctionNames
        continue

      do (functionName, callbackFuncs) => callbacks[functionName] = (values, cb) =>
        # When defined function has been called.
        onDone = (err) ->
          # delete values._mongooseModel
          if functionName in LifecycleFinalCallbackFunctionNames and values._mongooseDoc?
            for key in _.keys(values)
              delete values[key] if key isnt '_mongooseDoc'
            _.extend values, values._mongooseDoc.toObject()
            delete values._mongooseDoc
          cb err

        values._mongooseDoc ?= new (@mongooseModel())(values)
        async.series (_.bind(func, values._mongooseDoc) for func in callbackFuncs), onDone
    callbacks

  # Returns the nested schema.
  @_getSchema: -> _.extend (@__super__?.constructor?._getSchema() || {}), @prototype.schema

  # Returns the nested methods.
  @_getMethods: -> _.extend (@__super__?.constructor?._getMethods() || {}), @prototype.methods

  # Returns the nested statics.
  @getStatics: -> _.extend (@__super__?.constructor?.getStatics() || {}), @prototype.statics

  # Assemble the NOT cached mongoose schema.
  @_getMongooseSchema: ->
    mongooseSchema = new mongoose.Schema @_getSchema(), _id: no
    _.extend mongooseSchema.methods, @_getMethods()
    _.extend mongooseSchema.statics, @getStatics()
    mongooseSchema

  # Returns the NOT cached mongoose model.
  @_getMongooseModel: ->
    modelPath = @prototype.collection || @_getModelPathFromModelName()
    connection = @_connection()
    connection.model modelPath, @prototype._mongooseSchema

  @_connection: ->
    getMongooseDBConnection @prototype.adapter

  @_db: (cb) ->
    getMongoDB @prototype.adapter, cb

  # Returns the model path from model name.
  #
  # e.g.   class GroupModel -> groups
  #        class UserGroup -> user_groups
  @_getModelPathFromModelName: ->
    modelName = if @name.length > 5 and @name.substring(@name.length - 5) is 'Model'
      @name.substring(0, @name.length - 5)
    else
      @name
    changeCase.snakeCase modelName
