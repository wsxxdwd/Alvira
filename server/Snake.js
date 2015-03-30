function Snake(){
  this.playerId = -1;//所属玩家
  this.index = -1;//房内玩家序号
  this.body = [];//蛇身
  this.direction = "";//朝向
  this.status = "alive";
  this.eating = false;
}
Snake.prototype.move = function(){
  if(this.status == "dead"){
    return false;
  }
  this.eating = false;
  switch(this.direction){
    case "up":
      var nextMove = [this.body[0][0],this.body[0][1]];
      nextMove[1]--;
      break;
    case "down":
      var nextMove = [this.body[0][0],this.body[0][1]];
      nextMove[1]++;
      break;
    case "left":
      var nextMove = [this.body[0][0],this.body[0][1]];
      nextMove[0]--;
      break;
    case "right":
      var nextMove = [this.body[0][0],this.body[0][1]];
      nextMove[0]++;
      break;
  }
  this.body.unshift(nextMove);
}
Snake.prototype.init = function(playerId,room){
  this.playerId = playerId;
  for(var i in room.players){
    if(room.players[i].id == playerId){
      this.index = i;
    }
  }
  switch(this.index){
    case "0"://index 是for循环生成的i,所以是字符串
      this.body = [[4,4],[4,3]];
      this.direction = "down";
      break;
    case "1":
      this.body = [[20,20],[20,21]];
      this.direction = "up";
      break;
    case "2":
      this.body = [[20,4],[20,3]];
      this.direction = "down";
      break;
    case "3":
      this.body = [[4,20],[4,21]];
      this.direction = "up";
      break;
  }
}
Snake.prototype.checkEnv = function(){
  var head = this.body[0];
  if(head[0] <= 0 || head[0] >= 25 || head[1] <= 0 || head[1] >= 25){
    this.status = "dead";
    return {status:1,playerId:this.playerId,msg:"撞击边界而死"};
  }
  return {status:0};
}
Snake.prototype.eat = function(foods){
  var head = this.body[0];
  for(var i in foods){
    if(head[0] == foods[i][0] && head[1] == foods[i][1]){
      this.eating = true;
      foods.splice(i,1);//引用对象直接操作
      return true;
    }
  }
  return false;
}
Snake.prototype.checkStrike = function(snake,selfHead){
  var head = this.body[0];
  for(var i in snake){
    if(selfHead[0] == head[0] && selfHead[1] == head[1]){
      return {status:0};//忽略判断自己的头部
    }
    if(head[0] == snake[i][0] && head[1] == snake[i][1]){
      this.status = "dead";
      return {status:1,playerId:this.playerId,msg:"撞击身体而死"};
    }
  }
  return {status:0};
}
Snake.prototype.endMove = function(){
  if(!this.eating){
    this.body.pop();
  }
}
Snake.prototype.chahua = function(){
   //插花
}
module.exports = Snake;