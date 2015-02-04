var Movable = require('./Movable');
var movable_collection = require('./movable_collection');

module.exports = {
    applyVectorToPosition: function(position, vector) {
        position.x += vector.x;
        position.y += vector.y;
    },

    applyForceToMovable: function(Movable, forceVector) {
        this.applyVectorToPosition(Movable.position, forceVector);
    },

    applyVectorToVector: function(Vector1, Vector2) {
        Vector1.x += Vector2.x;
        Vector1.y += Vector2.y;
    }
};
