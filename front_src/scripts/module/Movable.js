var game_util = require('./game_util');
var Vector = require('./Vector');
var Position = require('./Position');
var game_config = require('./game_config');
var movable_collection = require('./movable_collection');

function Movable() {
    this.momentum = new Vector();
    this.position = new Position();
    this.fabricObject = null;
    movable_collection.add(this);
}

Movable.prototype.recalculatePosition = function() {
    game_util.applyVectorToPosition(this.position, this.momentum);
    // game_util.applyVectorToPosition(this.position, game_config.gravity);
    this.addMomentum(game_config.gravity);
    this.limitToCanvas();
    this.syncPositionWithFabricObject();
    this.decreaseMomentum();
};

Movable.prototype.changePosition = function(x, y) {
    this.position.x += x;
    this.position.y += y;
    this.syncPositionWithFabricObject();
};

Movable.prototype.setFabricObject = function(fabricObject) {
    this.fabricObject = fabricObject;
    this.syncPositionWithFabricObject();
};

Movable.prototype.syncPositionWithFabricObject = function() {
    this.fabricObject.left = this.position.x;
    this.fabricObject.top = this.position.y;
};

Movable.prototype.addMomentum = function(momentumVector) {
    game_util.applyVectorToVector(this.momentum, momentumVector);
};

Movable.prototype.decreaseMomentum = function() {
    if (this.momentum.x != 0) {
        if (this.momentum.x < 0) {
            this.momentum.x += game_config.momentumLossRate;
            if (this.momentum.x > 0) {
                this.momentum.x = 0;
            }
        } else {
            this.momentum.x -= game_config.momentumLossRate;
            if (this.momentum.x < 0) {
                this.momentum.x = 0;
            }
        }
    }

    if (this.momentum.y != 0) {
        if (this.momentum.y < 0) {
            this.momentum.y += game_config.momentumLossRate;
            if (this.momentum.y > 0) {
                this.momentum.y = 0;
            }
        } else {
            this.momentum.y -= game_config.momentumLossRate;
            if (this.momentum.y < 0) {
                this.momentum.y = 0;
            }
        }
    }
};

Movable.prototype.isOnBedRock = function() {
    if (this.position.y === game_config.canvas.height - this.fabricObject.height) {
        return true;
    }

    return false;
};

Movable.prototype.limitToCanvas = function() {
    if (this.position.x < 0) {
        this.position.x = 0;
        this.momentum.x = 0;
    }
    if (this.position.y < 0) {
        this.position.y = 0;
        this.momentum.y = 0;
    }
    var limit = game_config.canvas.width - this.fabricObject.width;
    if (this.position.x > limit) {
        this.position.x = limit;
        this.momentum.x = 0;
    }
    var limit = game_config.canvas.height - this.fabricObject.height;
    if (this.position.y > limit) {
        this.position.y = limit;
        this.momentum.y = 0;
    }
};

module.exports = Movable;
