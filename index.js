module.exports = Object.create(Object.prototype, {
  GroundModel: {
    get: function() {
      return require('./ground/GroundModel');
    }
  }
});
