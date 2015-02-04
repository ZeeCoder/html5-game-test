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
