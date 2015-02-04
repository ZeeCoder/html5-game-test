
module.exports = {
    canvas: null,
    lowerRightRect: null,
    width: 500,
    height: 800,
    boxSize: null,
    boxPadding: 5,
    colNum: 5,
    rowNum: null,
    uiHeight: 100,
    testRect: null,
    separatorLine: null,
    boxes: [],
    svgObj: null,
    blueBucket: null,
    redBucket: null,
    dropable: null,

    init: function () {
        var self = this;

        this.canvas = new fabric.Canvas(
            'canvas',
            {
                width: this.width,
                height: this.height + this.uiHeight,
                selection: false,
                backgroundColor: '#fff',
                containerClass: 'b-canvas-container'
            }
        );

        this.boxSize = this.width / this.colNum - this.boxPadding * 2;
        this.rowNum = Math.floor(this.height / this.boxSize);

        var boxNum = this.colNum * this.rowNum;
        var boxOffset = 2 * this.boxPadding + this.boxSize;
        this.canvas.renderOnAddRemove = false;
        for (var i = 0; i < boxNum; i++) {
            this.addBoxToPosition(
                i % this.colNum * boxOffset + this.boxPadding,
                Math.floor(i / this.colNum) * boxOffset + this.boxPadding
            );
        }
        this.canvas.renderOnAddRemove = true;

        this.separatorLine = new fabric.Line(
            [0, this.height, this.width, this.height],
            {
                stroke: '#000',
                strokeWidth: 2,
                selectable: false
            }
        );

        this.canvas.add(this.separatorLine);

        this.dropable = new fabric.Circle({
            radius: 20,
            fill: 'grey'
        });
        this.canvas.add(this.dropable);

        this.blueBucket = new fabric.Circle({
            radius: 20,
            fill: 'blue'
        });
        this.canvas.add(this.blueBucket);

        this.redBucket = new fabric.Circle({
            radius: 20,
            fill: 'red'
        });
        this.canvas.add(this.redBucket);

        this.resetBucketsPos();
        this.resetDropablePos();

        fabric.loadSVGFromURL(
            'images/html5.svg',
            function(objects, options){
                self.svgObj = fabric.util.groupSVGElements(objects, options);
                // self.svgObj.scaleToHeight(self.uiHeight - (10 * self.boxPadding));
                // self.svgObj.setCoords();
                // self.svgObj.set({height: 20, width: 20});
                self.resetSVGPos();
                self.canvas.add(self.svgObj);
                // self.canvas.renderAll();
            }
        );

        this.canvas.on('object:moving', function(e) {
            if (
                e.target === self.blueBucket ||
                e.target === self.redBucket
            ) {
                var paint = e.target === self.blueBucket ? 'blue': 'red';

                var intersectedBox = null;
                var render = false;
                e.target.setCoords();
                var boxesLength = self.boxes.length;
                for (var i = boxesLength - 1; i >= 0; i--) {
                    if (e.target.intersectsWithObject(self.boxes[i])) {
                        self.boxes[i].setFill(paint);
                        render = true;
                    }
                }

                if (render) {
                    self.canvas.renderAll();
                }
            }
        });


        this.canvas.on('mouse:up', function(e) {
            if (e.target === self.dropable) {
                var intersectedBox = null;
                var dropped = false;
                e.target.setCoords();
                var boxesLength = self.boxes.length;
                for (var i = boxesLength - 1; i >= 0; i--) {
                    if (
                        e.target.isContainedWithinObject(self.boxes[i]) &&
                        self.boxes[i].isDropzone
                    ) {
                        // self.boxes[i].setFill('white');
                        dropped = true;
                        break;
                    }
                }

                if (!dropped) {
                    self.resetDropablePos();
                }
            }
        });

        this.canvas.on('object:modified', function(e) {
            if (e.target === self.svgObj) {
                // self.resetSVGPos();
            }
        });

        this.canvas.on('mouse:move', function(options) {
            var p = self.canvas.getPointer(options.e);

            var boxesLength = self.boxes.length;
            for (var i = boxesLength - 1; i >= 0; i--) {
                var distX = Math.abs(p.x - self.boxes[i].left - self.boxSize / 2),
                    distY = Math.abs(p.y - self.boxes[i].top - self.boxSize / 2),
                    dist = Math.round(Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2)));

                self.boxes[i].setOpacity(1 / (dist / 100));
            };

            self.canvas.renderAll();
        });


        this.adjustCanvasSizeToViewport();

        $(window).on('resize orientationchange', function() {
            self.adjustCanvasSizeToViewport();
        });
    },

    adjustCanvasSizeToViewport: function () {
        var newWidth = $(window).height() / (this.height + this.uiHeight) * this.width;
        var newHeight = $(window).height();
        if (newWidth > $(window).width()) {
            newWidth = $(window).width();
            newHeight = $(window).width() / this.width * (this.height + this.uiHeight);
        }

        var canvas = this.canvas.getElement();
        var canvasSelection = this.canvas.getSelectionElement();
        var canvasContainer = $('.b-canvas-container')[0];

        var css = {width: newWidth, height: newHeight};
        $(canvas).css(css);
        $(canvasSelection).css(css);
        $(canvasContainer).css(css);

        this.canvas.renderAll();
    },

    addBoxToPosition: function(x, y) {
        var isDropzone = Math.random() > 0.8;

        var box = new fabric.Rect({
            left: x,
            top: y,
            fill: (isDropzone ? '#000': '#ddd'),
            width: this.boxSize,
            height: this.boxSize,
            selectable: false,
            opacity: 0.2
        });
        box.isDropzone = isDropzone;

        this.boxes.push(box);
        this.canvas.add(box);
    },

    resetSVGPos: function() {
        this.svgObj.setLeft(2 * this.boxPadding);
        this.svgObj.setTop(this.height + 2 * this.boxPadding);
        this.svgObj.setCoords();

        this.canvas.renderAll();
    },

    resetBucketsPos: function() {
        this.blueBucket.set({
            left: 100,
            top: this.height + 2 * this.boxPadding
        });
        this.blueBucket.setCoords();

        this.redBucket.set({
            left: 150,
            top: this.height + 2 * this.boxPadding
        });
        this.redBucket.setCoords();

        this.canvas.renderAll();
    },

    resetDropablePos: function() {
        this.dropable.set({
            left: 200,
            top: this.height + 2 * this.boxPadding
        });
        this.dropable.setCoords();

        this.canvas.renderAll();
    }
};
