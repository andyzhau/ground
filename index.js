var groundDb;

groundDb = require('./ground/ground_db');

module.exports = Object.create({
  initialize: function(options) {
    return groundDb.initialize(options);
  }
}, {
  GroundController: {
    get: function() {
      return require('./ground/GroundController');
    }
  },
  GroundFileModel: {
    get: function() {
      return require('./ground/GroundFileModel');
    }
  },
  GroundModel: {
    get: function() {
      return require('./ground/GroundModel');
    }
  },
  GroundPolicy: {
    get: function() {
      return require('./ground/GroundPolicy');
    }
  },
  GroundRoutes: {
    get: function() {
      return require('./ground/GroundRoutes');
    }
  }
});
