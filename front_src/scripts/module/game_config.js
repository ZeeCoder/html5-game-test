var Vector = require('./Vector');

module.exports = {
    gravity: new Vector(0, 3),
    momentumLossRate: 1,
    canvas: {
        width: 500,
        height: 200
    }
};
