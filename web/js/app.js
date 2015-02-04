(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var game = require('./module/game');
var game_config = require('./module/game_config');
var Vector = require('./module/Vector');

game.init();

window.game = game;
window.game_config = game_config;
window.Vector = Vector;

},{"./module/Vector":4,"./module/game":5,"./module/game_config":6}],2:[function(require,module,exports){
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

},{"./Position":3,"./Vector":4,"./game_config":6,"./game_util":7,"./movable_collection":8}],3:[function(require,module,exports){
module.exports = function Position(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

},{}],4:[function(require,module,exports){
module.exports = function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

},{}],5:[function(require,module,exports){
(function (global){
var fabric = (typeof window !== "undefined" ? window.fabric : typeof global !== "undefined" ? global.fabric : null);
var Movable = require('./Movable');
var Vector = require('./Vector');
var movable_collection = require('./movable_collection');
var game_config = require('./game_config');
var game_util = require('./game_util');
var $ = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

module.exports = {
    fps: 60,
    renderTime: 20,

    testPongBox: {
        dir: 1,
        mainBox: null,
        speed: 5,
        box: {
            sizeX: 20,
            sizeY: 20
        }
    },

    doubleJumpUsed: false,
    protagonist: null,

    init: function () {
        var self = this;

        this.renderTime = 1000 / this.fps;

        this.canvas = new fabric.Canvas(
            'canvas',
            {
                width: game_config.canvas.width,
                height: game_config.canvas.height,
                selection: false,
                backgroundColor: '#fff',
                containerClass: 'b-canvas-container'
            }
        );

        this.protagonist = new Movable();
        this.protagonist.setFabricObject(new fabric.Rect({
            fill: '#000',
            width: 10,
            height: 10,
            selectable: false
        }));

        // this.protagonist.changePosition(0, game_config.canvas.height - 10);
        this.protagonist.changePosition(0, 0);

        this.canvas.add(this.protagonist.fabricObject);

        // this.initializeTestPongBox();
        this.iterateRendering();

        $(window).keydown(function(event) {
            if (event.keyCode == 37) {
                self.protagonist.addMomentum(new Vector(-30, 0));
            }

            if (event.keyCode == 38) {
                if (self.protagonist.isOnBedRock()) {
                    self.doubleJumpUsed = false;
                }

                if (self.protagonist.isOnBedRock() || !self.doubleJumpUsed) {
                    self.protagonist.momentum = new Vector(self.protagonist.momentum.x, 0);
                    self.protagonist.addMomentum(new Vector(0, -30));
                    if (!self.protagonist.isOnBedRock()) {
                        self.doubleJumpUsed = true;
                    }
                }
            }

            // if (event.keyCode == 38) {
            //     self.protagonist.addMomentum(new Vector(0, -30));
            // }

            if (event.keyCode == 39) {
                self.protagonist.addMomentum(new Vector(30, 0));
            }

            if (event.keyCode == 40) {
                self.protagonist.addMomentum(new Vector(0, 30));
            }

            // if (event.keyCode == 37) {
            //     self.changeGravity(-1, 0);
            // }
            // if (event.keyCode == 38) {
            //     self.changeGravity(0, -1);
            // }

            // if (event.keyCode == 39) {
            //     self.changeGravity(1, 0);
            // }
            // if (event.keyCode == 40) {
            //     self.changeGravity(0, 1);
            // }
        });
    },


    changeGravity: function(x, y) {
        game_config.gravity = new Vector(x, y);
    },

    iterateRendering: function() {
        var self = this;

        // this.moveTestPongBox();
        for (var i = movable_collection.containerLength - 1; i >= 0; i--) {
            movable_collection.container[i].recalculatePosition();
        };
        this.canvas.renderAll();

        setTimeout(function(){
            self.iterateRendering();
        }, this.renderTime);
    },

    initializeTestPongBox: function() {
        this.testPongBox.mainBox = new fabric.Rect({
            left: 0,
            top: 0,
            fill: '#000',
            width: this.testPongBox.box.sizeX,
            height: this.testPongBox.box.sizeY,
            selectable: false
        });

        this.canvas.add(this.testPongBox.mainBox);
    },

    moveTestPongBox: function() {
        var maxLeft = this.width - this.testPongBox.box.sizeX;

        this.testPongBox.mainBox.left += this.testPongBox.speed * this.testPongBox.dir;
        if (
            this.testPongBox.dir === 1 &&
            this.testPongBox.mainBox.left > maxLeft
        ) {
            this.testPongBox.mainBox.left = maxLeft;
        } else if (
            this.testPongBox.dir === -1 &&
            this.testPongBox.mainBox.left < 0
        ) {
            this.testPongBox.mainBox.left = 0;
        }

        if (this.testPongBox.mainBox.left === maxLeft) {
            this.testPongBox.dir = -1;
        } else if (this.testPongBox.mainBox.left === 0) {
            this.testPongBox.dir = 1;
        }
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Movable":2,"./Vector":4,"./game_config":6,"./game_util":7,"./movable_collection":8}],6:[function(require,module,exports){
var Vector = require('./Vector');

module.exports = {
    gravity: new Vector(0, 3),
    momentumLossRate: 1,
    canvas: {
        width: 500,
        height: 200
    }
};

},{"./Vector":4}],7:[function(require,module,exports){
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

},{"./Movable":2,"./movable_collection":8}],8:[function(require,module,exports){
module.exports = {
    container: [],
    containerLength: 0,

    add: function(movable) {
        this.container.push(movable);
        this.containerLength++;
    },

    remove: function(movable) {
        var index = this.container.indexOf(movable);
        if (index !== -1) {
            this.container.splice(index, 1);
            this.containerLength--;
        }
    }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZnJvbnRfc3JjXFxzY3JpcHRzXFxhcHAuanMiLCJmcm9udF9zcmNcXHNjcmlwdHNcXG1vZHVsZVxcTW92YWJsZS5qcyIsImZyb250X3NyY1xcc2NyaXB0c1xcbW9kdWxlXFxQb3NpdGlvbi5qcyIsImZyb250X3NyY1xcc2NyaXB0c1xcbW9kdWxlXFxWZWN0b3IuanMiLCJmcm9udF9zcmNcXHNjcmlwdHNcXG1vZHVsZVxcZ2FtZS5qcyIsImZyb250X3NyY1xcc2NyaXB0c1xcbW9kdWxlXFxnYW1lX2NvbmZpZy5qcyIsImZyb250X3NyY1xcc2NyaXB0c1xcbW9kdWxlXFxnYW1lX3V0aWwuanMiLCJmcm9udF9zcmNcXHNjcmlwdHNcXG1vZHVsZVxcbW92YWJsZV9jb2xsZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnYW1lID0gcmVxdWlyZSgnLi9tb2R1bGUvZ2FtZScpO1xyXG52YXIgZ2FtZV9jb25maWcgPSByZXF1aXJlKCcuL21vZHVsZS9nYW1lX2NvbmZpZycpO1xyXG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi9tb2R1bGUvVmVjdG9yJyk7XHJcblxyXG5nYW1lLmluaXQoKTtcclxuXHJcbndpbmRvdy5nYW1lID0gZ2FtZTtcclxud2luZG93LmdhbWVfY29uZmlnID0gZ2FtZV9jb25maWc7XHJcbndpbmRvdy5WZWN0b3IgPSBWZWN0b3I7XHJcbiIsInZhciBnYW1lX3V0aWwgPSByZXF1aXJlKCcuL2dhbWVfdXRpbCcpO1xyXG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcclxudmFyIFBvc2l0aW9uID0gcmVxdWlyZSgnLi9Qb3NpdGlvbicpO1xyXG52YXIgZ2FtZV9jb25maWcgPSByZXF1aXJlKCcuL2dhbWVfY29uZmlnJyk7XHJcbnZhciBtb3ZhYmxlX2NvbGxlY3Rpb24gPSByZXF1aXJlKCcuL21vdmFibGVfY29sbGVjdGlvbicpO1xyXG5cclxuZnVuY3Rpb24gTW92YWJsZSgpIHtcclxuICAgIHRoaXMubW9tZW50dW0gPSBuZXcgVmVjdG9yKCk7XHJcbiAgICB0aGlzLnBvc2l0aW9uID0gbmV3IFBvc2l0aW9uKCk7XHJcbiAgICB0aGlzLmZhYnJpY09iamVjdCA9IG51bGw7XHJcbiAgICBtb3ZhYmxlX2NvbGxlY3Rpb24uYWRkKHRoaXMpO1xyXG59XHJcblxyXG5Nb3ZhYmxlLnByb3RvdHlwZS5yZWNhbGN1bGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICBnYW1lX3V0aWwuYXBwbHlWZWN0b3JUb1Bvc2l0aW9uKHRoaXMucG9zaXRpb24sIHRoaXMubW9tZW50dW0pO1xyXG4gICAgLy8gZ2FtZV91dGlsLmFwcGx5VmVjdG9yVG9Qb3NpdGlvbih0aGlzLnBvc2l0aW9uLCBnYW1lX2NvbmZpZy5ncmF2aXR5KTtcclxuICAgIHRoaXMuYWRkTW9tZW50dW0oZ2FtZV9jb25maWcuZ3Jhdml0eSk7XHJcbiAgICB0aGlzLmxpbWl0VG9DYW52YXMoKTtcclxuICAgIHRoaXMuc3luY1Bvc2l0aW9uV2l0aEZhYnJpY09iamVjdCgpO1xyXG4gICAgdGhpcy5kZWNyZWFzZU1vbWVudHVtKCk7XHJcbn07XHJcblxyXG5Nb3ZhYmxlLnByb3RvdHlwZS5jaGFuZ2VQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHRoaXMucG9zaXRpb24ueCArPSB4O1xyXG4gICAgdGhpcy5wb3NpdGlvbi55ICs9IHk7XHJcbiAgICB0aGlzLnN5bmNQb3NpdGlvbldpdGhGYWJyaWNPYmplY3QoKTtcclxufTtcclxuXHJcbk1vdmFibGUucHJvdG90eXBlLnNldEZhYnJpY09iamVjdCA9IGZ1bmN0aW9uKGZhYnJpY09iamVjdCkge1xyXG4gICAgdGhpcy5mYWJyaWNPYmplY3QgPSBmYWJyaWNPYmplY3Q7XHJcbiAgICB0aGlzLnN5bmNQb3NpdGlvbldpdGhGYWJyaWNPYmplY3QoKTtcclxufTtcclxuXHJcbk1vdmFibGUucHJvdG90eXBlLnN5bmNQb3NpdGlvbldpdGhGYWJyaWNPYmplY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmFicmljT2JqZWN0LmxlZnQgPSB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICB0aGlzLmZhYnJpY09iamVjdC50b3AgPSB0aGlzLnBvc2l0aW9uLnk7XHJcbn07XHJcblxyXG5Nb3ZhYmxlLnByb3RvdHlwZS5hZGRNb21lbnR1bSA9IGZ1bmN0aW9uKG1vbWVudHVtVmVjdG9yKSB7XHJcbiAgICBnYW1lX3V0aWwuYXBwbHlWZWN0b3JUb1ZlY3Rvcih0aGlzLm1vbWVudHVtLCBtb21lbnR1bVZlY3Rvcik7XHJcbn07XHJcblxyXG5Nb3ZhYmxlLnByb3RvdHlwZS5kZWNyZWFzZU1vbWVudHVtID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5tb21lbnR1bS54ICE9IDApIHtcclxuICAgICAgICBpZiAodGhpcy5tb21lbnR1bS54IDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLm1vbWVudHVtLnggKz0gZ2FtZV9jb25maWcubW9tZW50dW1Mb3NzUmF0ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW9tZW50dW0ueCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9tZW50dW0ueCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm1vbWVudHVtLnggLT0gZ2FtZV9jb25maWcubW9tZW50dW1Mb3NzUmF0ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMubW9tZW50dW0ueCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9tZW50dW0ueCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubW9tZW50dW0ueSAhPSAwKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW9tZW50dW0ueSA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5tb21lbnR1bS55ICs9IGdhbWVfY29uZmlnLm1vbWVudHVtTG9zc1JhdGU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vbWVudHVtLnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vbWVudHVtLnkgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5tb21lbnR1bS55IC09IGdhbWVfY29uZmlnLm1vbWVudHVtTG9zc1JhdGU7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vbWVudHVtLnkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vbWVudHVtLnkgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuTW92YWJsZS5wcm90b3R5cGUuaXNPbkJlZFJvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLnBvc2l0aW9uLnkgPT09IGdhbWVfY29uZmlnLmNhbnZhcy5oZWlnaHQgLSB0aGlzLmZhYnJpY09iamVjdC5oZWlnaHQpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5Nb3ZhYmxlLnByb3RvdHlwZS5saW1pdFRvQ2FudmFzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy5wb3NpdGlvbi54IDwgMCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb21lbnR1bS54ID0gMDtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBvc2l0aW9uLnkgPCAwKSB7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gMDtcclxuICAgICAgICB0aGlzLm1vbWVudHVtLnkgPSAwO1xyXG4gICAgfVxyXG4gICAgdmFyIGxpbWl0ID0gZ2FtZV9jb25maWcuY2FudmFzLndpZHRoIC0gdGhpcy5mYWJyaWNPYmplY3Qud2lkdGg7XHJcbiAgICBpZiAodGhpcy5wb3NpdGlvbi54ID4gbGltaXQpIHtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBsaW1pdDtcclxuICAgICAgICB0aGlzLm1vbWVudHVtLnggPSAwO1xyXG4gICAgfVxyXG4gICAgdmFyIGxpbWl0ID0gZ2FtZV9jb25maWcuY2FudmFzLmhlaWdodCAtIHRoaXMuZmFicmljT2JqZWN0LmhlaWdodDtcclxuICAgIGlmICh0aGlzLnBvc2l0aW9uLnkgPiBsaW1pdCkge1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24ueSA9IGxpbWl0O1xyXG4gICAgICAgIHRoaXMubW9tZW50dW0ueSA9IDA7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1vdmFibGU7XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUG9zaXRpb24oeCwgeSkge1xyXG4gICAgdGhpcy54ID0geCB8fCAwO1xyXG4gICAgdGhpcy55ID0geSB8fCAwO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFZlY3Rvcih4LCB5KSB7XHJcbiAgICB0aGlzLnggPSB4IHx8IDA7XHJcbiAgICB0aGlzLnkgPSB5IHx8IDA7XHJcbn07XHJcbiIsInZhciBmYWJyaWMgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5mYWJyaWMgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmZhYnJpYyA6IG51bGwpO1xyXG52YXIgTW92YWJsZSA9IHJlcXVpcmUoJy4vTW92YWJsZScpO1xyXG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcclxudmFyIG1vdmFibGVfY29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vbW92YWJsZV9jb2xsZWN0aW9uJyk7XHJcbnZhciBnYW1lX2NvbmZpZyA9IHJlcXVpcmUoJy4vZ2FtZV9jb25maWcnKTtcclxudmFyIGdhbWVfdXRpbCA9IHJlcXVpcmUoJy4vZ2FtZV91dGlsJyk7XHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuJCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuJCA6IG51bGwpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBmcHM6IDYwLFxyXG4gICAgcmVuZGVyVGltZTogMjAsXHJcblxyXG4gICAgdGVzdFBvbmdCb3g6IHtcclxuICAgICAgICBkaXI6IDEsXHJcbiAgICAgICAgbWFpbkJveDogbnVsbCxcclxuICAgICAgICBzcGVlZDogNSxcclxuICAgICAgICBib3g6IHtcclxuICAgICAgICAgICAgc2l6ZVg6IDIwLFxyXG4gICAgICAgICAgICBzaXplWTogMjBcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGRvdWJsZUp1bXBVc2VkOiBmYWxzZSxcclxuICAgIHByb3RhZ29uaXN0OiBudWxsLFxyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyVGltZSA9IDEwMDAgLyB0aGlzLmZwcztcclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBuZXcgZmFicmljLkNhbnZhcyhcclxuICAgICAgICAgICAgJ2NhbnZhcycsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiBnYW1lX2NvbmZpZy5jYW52YXMud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGdhbWVfY29uZmlnLmNhbnZhcy5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICBjb250YWluZXJDbGFzczogJ2ItY2FudmFzLWNvbnRhaW5lcidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMucHJvdGFnb25pc3QgPSBuZXcgTW92YWJsZSgpO1xyXG4gICAgICAgIHRoaXMucHJvdGFnb25pc3Quc2V0RmFicmljT2JqZWN0KG5ldyBmYWJyaWMuUmVjdCh7XHJcbiAgICAgICAgICAgIGZpbGw6ICcjMDAwJyxcclxuICAgICAgICAgICAgd2lkdGg6IDEwLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDEwLFxyXG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5wcm90YWdvbmlzdC5jaGFuZ2VQb3NpdGlvbigwLCBnYW1lX2NvbmZpZy5jYW52YXMuaGVpZ2h0IC0gMTApO1xyXG4gICAgICAgIHRoaXMucHJvdGFnb25pc3QuY2hhbmdlUG9zaXRpb24oMCwgMCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FudmFzLmFkZCh0aGlzLnByb3RhZ29uaXN0LmZhYnJpY09iamVjdCk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuaW5pdGlhbGl6ZVRlc3RQb25nQm94KCk7XHJcbiAgICAgICAgdGhpcy5pdGVyYXRlUmVuZGVyaW5nKCk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5rZXlkb3duKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09IDM3KSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnByb3RhZ29uaXN0LmFkZE1vbWVudHVtKG5ldyBWZWN0b3IoLTMwLCAwKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09IDM4KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5wcm90YWdvbmlzdC5pc09uQmVkUm9jaygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kb3VibGVKdW1wVXNlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnByb3RhZ29uaXN0LmlzT25CZWRSb2NrKCkgfHwgIXNlbGYuZG91YmxlSnVtcFVzZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnByb3RhZ29uaXN0Lm1vbWVudHVtID0gbmV3IFZlY3RvcihzZWxmLnByb3RhZ29uaXN0Lm1vbWVudHVtLngsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucHJvdGFnb25pc3QuYWRkTW9tZW50dW0obmV3IFZlY3RvcigwLCAtMzApKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbGYucHJvdGFnb25pc3QuaXNPbkJlZFJvY2soKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmRvdWJsZUp1bXBVc2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmIChldmVudC5rZXlDb2RlID09IDM4KSB7XHJcbiAgICAgICAgICAgIC8vICAgICBzZWxmLnByb3RhZ29uaXN0LmFkZE1vbWVudHVtKG5ldyBWZWN0b3IoMCwgLTMwKSk7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09IDM5KSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnByb3RhZ29uaXN0LmFkZE1vbWVudHVtKG5ldyBWZWN0b3IoMzAsIDApKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDApIHtcclxuICAgICAgICAgICAgICAgIHNlbGYucHJvdGFnb25pc3QuYWRkTW9tZW50dW0obmV3IFZlY3RvcigwLCAzMCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAoZXZlbnQua2V5Q29kZSA9PSAzNykge1xyXG4gICAgICAgICAgICAvLyAgICAgc2VsZi5jaGFuZ2VHcmF2aXR5KC0xLCAwKTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAvLyBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOCkge1xyXG4gICAgICAgICAgICAvLyAgICAgc2VsZi5jaGFuZ2VHcmF2aXR5KDAsIC0xKTtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgKGV2ZW50LmtleUNvZGUgPT0gMzkpIHtcclxuICAgICAgICAgICAgLy8gICAgIHNlbGYuY2hhbmdlR3Jhdml0eSgxLCAwKTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAvLyBpZiAoZXZlbnQua2V5Q29kZSA9PSA0MCkge1xyXG4gICAgICAgICAgICAvLyAgICAgc2VsZi5jaGFuZ2VHcmF2aXR5KDAsIDEpO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICBjaGFuZ2VHcmF2aXR5OiBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICAgICAgZ2FtZV9jb25maWcuZ3Jhdml0eSA9IG5ldyBWZWN0b3IoeCwgeSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGl0ZXJhdGVSZW5kZXJpbmc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgLy8gdGhpcy5tb3ZlVGVzdFBvbmdCb3goKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gbW92YWJsZV9jb2xsZWN0aW9uLmNvbnRhaW5lckxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIG1vdmFibGVfY29sbGVjdGlvbi5jb250YWluZXJbaV0ucmVjYWxjdWxhdGVQb3NpdGlvbigpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jYW52YXMucmVuZGVyQWxsKCk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgc2VsZi5pdGVyYXRlUmVuZGVyaW5nKCk7XHJcbiAgICAgICAgfSwgdGhpcy5yZW5kZXJUaW1lKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdGlhbGl6ZVRlc3RQb25nQm94OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLnRlc3RQb25nQm94Lm1haW5Cb3ggPSBuZXcgZmFicmljLlJlY3Qoe1xyXG4gICAgICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgICAgIGZpbGw6ICcjMDAwJyxcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMudGVzdFBvbmdCb3guYm94LnNpemVYLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMudGVzdFBvbmdCb3guYm94LnNpemVZLFxyXG4gICAgICAgICAgICBzZWxlY3RhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcy5hZGQodGhpcy50ZXN0UG9uZ0JveC5tYWluQm94KTtcclxuICAgIH0sXHJcblxyXG4gICAgbW92ZVRlc3RQb25nQm94OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWF4TGVmdCA9IHRoaXMud2lkdGggLSB0aGlzLnRlc3RQb25nQm94LmJveC5zaXplWDtcclxuXHJcbiAgICAgICAgdGhpcy50ZXN0UG9uZ0JveC5tYWluQm94LmxlZnQgKz0gdGhpcy50ZXN0UG9uZ0JveC5zcGVlZCAqIHRoaXMudGVzdFBvbmdCb3guZGlyO1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgdGhpcy50ZXN0UG9uZ0JveC5kaXIgPT09IDEgJiZcclxuICAgICAgICAgICAgdGhpcy50ZXN0UG9uZ0JveC5tYWluQm94LmxlZnQgPiBtYXhMZWZ0XHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGVzdFBvbmdCb3gubWFpbkJveC5sZWZ0ID0gbWF4TGVmdDtcclxuICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICB0aGlzLnRlc3RQb25nQm94LmRpciA9PT0gLTEgJiZcclxuICAgICAgICAgICAgdGhpcy50ZXN0UG9uZ0JveC5tYWluQm94LmxlZnQgPCAwXHJcbiAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGVzdFBvbmdCb3gubWFpbkJveC5sZWZ0ID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRlc3RQb25nQm94Lm1haW5Cb3gubGVmdCA9PT0gbWF4TGVmdCkge1xyXG4gICAgICAgICAgICB0aGlzLnRlc3RQb25nQm94LmRpciA9IC0xO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy50ZXN0UG9uZ0JveC5tYWluQm94LmxlZnQgPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy50ZXN0UG9uZ0JveC5kaXIgPSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuIiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGdyYXZpdHk6IG5ldyBWZWN0b3IoMCwgMyksXHJcbiAgICBtb21lbnR1bUxvc3NSYXRlOiAxLFxyXG4gICAgY2FudmFzOiB7XHJcbiAgICAgICAgd2lkdGg6IDUwMCxcclxuICAgICAgICBoZWlnaHQ6IDIwMFxyXG4gICAgfVxyXG59O1xyXG4iLCJ2YXIgTW92YWJsZSA9IHJlcXVpcmUoJy4vTW92YWJsZScpO1xyXG52YXIgbW92YWJsZV9jb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9tb3ZhYmxlX2NvbGxlY3Rpb24nKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgYXBwbHlWZWN0b3JUb1Bvc2l0aW9uOiBmdW5jdGlvbihwb3NpdGlvbiwgdmVjdG9yKSB7XHJcbiAgICAgICAgcG9zaXRpb24ueCArPSB2ZWN0b3IueDtcclxuICAgICAgICBwb3NpdGlvbi55ICs9IHZlY3Rvci55O1xyXG4gICAgfSxcclxuXHJcbiAgICBhcHBseUZvcmNlVG9Nb3ZhYmxlOiBmdW5jdGlvbihNb3ZhYmxlLCBmb3JjZVZlY3Rvcikge1xyXG4gICAgICAgIHRoaXMuYXBwbHlWZWN0b3JUb1Bvc2l0aW9uKE1vdmFibGUucG9zaXRpb24sIGZvcmNlVmVjdG9yKTtcclxuICAgIH0sXHJcblxyXG4gICAgYXBwbHlWZWN0b3JUb1ZlY3RvcjogZnVuY3Rpb24oVmVjdG9yMSwgVmVjdG9yMikge1xyXG4gICAgICAgIFZlY3RvcjEueCArPSBWZWN0b3IyLng7XHJcbiAgICAgICAgVmVjdG9yMS55ICs9IFZlY3RvcjIueTtcclxuICAgIH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBjb250YWluZXI6IFtdLFxyXG4gICAgY29udGFpbmVyTGVuZ3RoOiAwLFxyXG5cclxuICAgIGFkZDogZnVuY3Rpb24obW92YWJsZSkge1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLnB1c2gobW92YWJsZSk7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXJMZW5ndGgrKztcclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihtb3ZhYmxlKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jb250YWluZXIuaW5kZXhPZihtb3ZhYmxlKTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTGVuZ3RoLS07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG4iXX0=
