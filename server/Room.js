function Room(data){
  this.id = data.id;
  this.name = data.name;
  this.holder = data.holder;
  this.status = data.status;
  this.players = data.players;
  this.tickNo = 0;
  this.snakes = [];
  this.foods = [];
  this.maxPlayer = 4;//最大玩家数
}
Room.prototype.start = function(game){
  if(this.status != "ready")
    return false
  for(var i in this.players){
    var snake = this.players[i].createSnake(this);
    this.snakes.push(snake);
  }
  this.status = "play";
  this.createFood();
  this.tick(game);
  return true;
}
Room.prototype.stop = function(playerId,game){
  if(playerId == this.holder.id){
    game.roomBroadcast(playerId,"room_close",{},this.id);//房间关闭信息
    game.$delRoom(this.id);
    console.log("房间关闭")
    return 0;
  }
  this.status = "wait";
  for(var i in this.players)
    this.players[i].status = "wait";
  this.snakes = [];
  this.foods = [];
  this.tickNo = 0;
  game.roomBroadcast(playerId,"game_stop",{},this.id);//通知改变玩家状态
  game.roomBroadcast(playerId,"update_room_info",{room:this},this.id);//通知改变房间信息
  game.roomBroadcast(0,"room_msg",{from:"系统",content:"游戏结束"},this.id);
  return 1;
}
Room.prototype.changeDirection = function(playerId,turn){
  for(var i in this.players){
    if(this.players[i].id == playerId){
      if(this.snakes[i].status == "alive"){
        if((turn == "left" && this.snakes[i].direction == "right") ||
           (turn == "right" && this.snakes[i].direction == "left") ||
           (turn == "up" && this.snakes[i].direction == "down") ||
           (turn == "down" && this.snakes[i].direction == "up") 
          )
          return false;
        this.snakes[i].turn = turn;
        return true;
        //snakes的数组序列和players的一一对应
      }
    }
  }
}
Room.prototype.chahua = function(playerId){
  for(var i in this.players){
    if(this.players[i].id == playerId){
      this.snakes[i].chahua();
    }
  }
}
Room.prototype.tick = function(game){
  if(this.status == "wait"){
    return false;
  }
  this.tickNo ++;//循环节点
  for(var i in this.snakes){//这里拆分成多个循环可以解决数组先后导致的不同步mark
    if(this.snakes[i].status == "alive"){
      this.snakes[i].move();
      //判断是否出图
      var checkInfo = this.snakes[i].checkEnv();
      if(checkInfo.status){
        game.roomBroadcast(0,"room_msg",{from:"系统",content:"玩家"+game.$player(checkInfo.playerId).name+checkInfo.msg},this.id);
      }
      for(var j in this.snakes){
        if(this.snakes[j].status == "alive" && this.snakes[i].status == "alive"){
          //检查与其他蛇的碰撞,目前是先进房的先移动后判断碰撞,所以有优势
          if(this.snakes[j].playerId == this.snakes[i].playerId){
            var isSelf = true;
          }else{
            var isSelf = false;
          }
          var strikeInfo = this.snakes[i].checkStrike(this.snakes[j].body,isSelf);
          if(strikeInfo.status){
            game.roomBroadcast(0,"room_msg",{from:"系统",content:"玩家"+game.$player(strikeInfo.playerId).name+strikeInfo.msg},this.id);
          }
        }
      }
      //吃个痛快
      this.snakes[i].eat(this.foods);
      //结束移动,判断是否需要增加蛇长
      this.snakes[i].endMove();
    }
  }
  //本回合移动完了补充食物
  this.createFood();
  //判断游戏是否结束
  var alivePlayer = 0;
  var lastPlayer = false;
  for(var i in this.snakes){
    if(this.snakes[i].status == "alive"){
      alivePlayer ++;
      lastPlayer = this.snakes[i];
    }
  }
  if(alivePlayer < 2){
    this.stop(0,game);
    var winner = "没有人"
    if(lastPlayer){
      winner = game.$player(lastPlayer.playerId).name
    }
    game.roomBroadcast(0,"room_msg",{from:"系统",content:"玩家"+winner+"成为最后的赢家"},this.id);
  }
  this.gameData(game);
  //循环
  setTimeout(
    function(self){
      return function(){
        self.tick(game);
      }
    }(this),500);
}
Room.prototype.gameData = function(game){
  
  game.roomBroadcast(0,"gameData",{snakes:this.snakes,foods:this.foods,tick:this.tickNo},this.id);
}
Room.prototype.createFood = function(){
  if(this.foods.length < this.players.length){
    var food = [Math.floor(Math.random()*25),Math.floor(Math.random()*25)];
    for(var i in this.snakes){
      for(var j in this.snakes[i].body){
        var section = this.snakes[i].body[j];
        if(section[0] == food[0] && section[1] == food[1]){
          return this.createFood();//和蛇重合,重新生成食物
        }
      }
    }
    for(var i in this.food){
      if(this.foods[i][0] == food[0] && this.foods[i][1] == food[1]){
        return this.createFood();//和已有重合,重新生成食物
      }
    }
    this.foods.push(food);//添加食物;
    this.createFood();//继续生产食物直到和玩家数量一样;
    return this.foods;
  }
}
module.exports = Room;
