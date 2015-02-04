var fabric = require('fabric');
var Movable = require('./Movable');
var Vector = require('./Vector');
var movable_collection = require('./movable_collection');
var game_config = require('./game_config');
var game_util = require('./game_util');
var $ = require('jquery');

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
