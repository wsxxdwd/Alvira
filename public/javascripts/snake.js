function Snake(){
  this.playerId = -1;//所属玩家
  this.index = -1;//房内玩家序号
  this.body = [];//蛇身
  this.direction = "";//朝向
  this.status = "alive"
}
Snake.prototype.move = function(){
  if(this.status == "dead"){
    return false;
  }
  this.eating = false;
  switch(this.direction){
    case "up":
      var nextMove = this.body[0];
      nextMove[1]--;
    case "down":
      var nextMove = this.body[0];
      nextMove[1]++;
    case "left":
      var nextMove = this.body[0];
      nextMove[0]--;
    case "right":
      var nextMove = this.body[0];
      nextMove[0]++;
  }
  this.body.unshift(nextMove);
  this.checkEnv(nextMove);
}
Snake.prototype.init = function(playerId,room){
  this.playerId = playerId;
  for(var i in room.players){
    if(room.players[i].id == playerId){
      this.index = i;
    }
  }
  switch(index){
    case 0:
      this.body = [[4,4],[4,3]];
      this.direction = "down";
    case 1:
      this.body = [[21,21],[21,22]];
      this.direction = "up";
    case 2:
      this.body = [[21,4],[21,3]];
      this.direction = "down";
    case 3:
      this.body = [[4,21],[4,22]];
      this.direction = "up";
  }
}
Snake.prototype.checkEnv = function(head){
  if(head[0] <= 0 || head[0] >= 25 || head[1] <= 0 || head[1] >= 25){
    this.status = "dead";
    return {status:0,msg:"撞击边界"};
  }
}
Snake.prototype.eat = function(head,foods){
  for(var i in foods){
    if(head[0] == foods[i][0] && head[1] == foods[i][1]){
      this.eating = true;
    }
  }
}
Snake.prototype.endMove = function(){
  if(!this.eating){
    this.body.pop();
  }
}
Snake.prototype.chahua = function(){
   //插花
}