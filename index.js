var groundDb;

groundDb = require('./ground/ground_db');

module.exports = Object.create({
  initialize: function(options) {
    return groundDb.initialize(options);
  }
}, {
  GroundModel: {
    get: function() {
      return require('./ground/GroundModel');
    }
  }
});
