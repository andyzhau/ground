Object.create({}, {
  GroundModel: {
    get: function() {
      return require('./ground/GroundModel');
    }
  }
});
