var Snake = require("./Snake");
function Player(data){
  this.name = data.name;
  this.color = data.color;
  this.socket = data.socket;
  this.id = data.id;
  this.status = "";
}
Player.prototype.createSnake = function(room){
  var snake = new Snake();
  snake.init(this.id,room);
  return snake;
}
module.exports = Player;