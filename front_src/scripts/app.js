var game = require('./module/game');
var game_config = require('./module/game_config');
var Vector = require('./module/Vector');

game.init();

window.game = game;
window.game_config = game_config;
window.Vector = Vector;
