function GameSever(io){
  var _this = this;
  this.roomList = [];//开启的房间
  this.playerList = [];//在线玩家
  this.playerNumber = 0;//历史玩家数
  this.roomNumber = 0;//历史房间数
  this.socketList = {};
  this.addNewPlayer = function(data,socket){
    if(this.$player(socket)){
      return false;
    }
    this.playerNumber ++;
    var player = {
      name : data.name,
      color : data.color,
      socket : socket.id,
      id : _this.playerNumber
    }
    this.playerList.push(player);
    this.socketList[_this.playerNumber] = socket;
    return this.playerNumber;
  }
  this.createRoom = function(data,socket){
    var player = this.$player(data.id);
    if(player){
      player.status = "wait";
      this.roomNumber ++;
      var room = {
        id : _this.roomNumber,
        name : data.name,
        players : [player],
        holder : player
      }
      this.roomList.push(room);
    }
    return this.roomNumber;
  }
  this.joinGame = function(data,socket){
    var player = this.$player(data.playerId);
    if(!player){
      return {status:0,msg:"玩家不存在"};
    }
    var room = this.$room(data.roomId);
    if(!room){
      return {status:0,msg:"房间不存在"};
    }
    for(var i in room.players){
      if(data.playerId == room.players[i].id){
        return {status:0,msg:"不能重复进入房间"};
      }
    }
    player.status = "wait";
    room.players.push(player);
    return {status:1,room:room};
  }
  this.leftGame = function(data,socket){
    var player = this.$player(data.playerId);
    if(!player){
      return {status:0,msg:"玩家不存在"};
    }
    var room = this.$room(data.roomId);
    if(!room){
      return {status:0,msg:"房间不存在"};
    }
    for(var i in room.players){
      if(data.playerId == room.players[i].id){
        room.players.splice(i,1);
      }
    }
    return {status:1,room:room};
  }
  this.roomBroadcast = function(from,title,data,roomId){
    var room = this.$room(roomId);
    if(room){
      for(var i in room.players){
        if(from != room.players[i].id){
          console.log(room.players[i].name)
          var so = this.socketList[room.players[i].id];
          so.emit(title,data);
        }
      }
    }
  }
  this.initListener = function(){
    io.on('connection', function(socket){ //socket connect
      console.log("someone connected")

      socket.on('register', function(data){ //player register
        var playerId = _this.addNewPlayer(data,socket);
        if(playerId)
          socket.emit("reg_response",{id:playerId});
        else
          socket.emit("reg_response",{id:false,msg:"请勿重复注册"});
      });
      socket.on('hold_game', function(data){ //player hold game
        var roomId = _this.createRoom(data,socket);
        if(roomId){
          socket.emit("create_room_response",{id:roomId});
          socket.emit("room_info",{status:1,room:_this.$room(roomId)});
        }else
          socket.emit("reg_response",{id:false,msg:"创建房间失败"});
      });
      socket.on("join_game",function(data){
        var res = _this.joinGame(data,socket);
        socket.emit("room_info",res);
        _this.roomBroadcast(data.playerId,"update_room_info",res,data.roomId);
        _this.roomBroadcast(0,"room_msg",{from:"系统",content:"新玩家 " + _this.$player(data.playerId).name + " 加入了游戏"},data.roomId);
      });
      socket.on("left_game",function(data){
        var res = _this.leftGame(data,socket);
        _this.roomBroadcast(data.playerId,"update_room_info",res,data.roomId);
        _this.roomBroadcast(0,"room_msg",{from:"系统",content:"玩家 " + _this.$player(data.playerId).name + " 退出了游戏"},data.roomId);
      });
      socket.on("playerList",function(data){
        socket.emit("playerList",{list:_this.playerList});
      });
      socket.on("roomList",function(data){
        //console.log(_this.roomList)
        socket.emit("roomList",{list:_this.roomList});
      });
      socket.on('disconnect',function(data){
        console.log("a plyaer disconnect");
        _this.$delRoom(socket);
        _this.$delPlayer(socket);
      });
    });
  }
  this.$player = function(val){
    if(typeof val == "number")
      for(var i in this.playerList){
        if(this.playerList[i].id == val){
          return this.playerList[i];
        }
      }
    else if(typeof val == "object")
      for(var i in this.playerList){
        if(this.playerList[i].socket == val.id){
          return this.playerList[i];
        }
      }
    return false;
  }
  this.$delPlayer = function(val){
    if(typeof val == "number")
      for(var i in this.playerList){
        if(this.playerList[i].id == val){
          return this.playerList.splice(i,1);
        }
      }
    else if(typeof val == "object")
      for(var i in this.playerList){
        if(this.playerList[i].socket == val.id){
          return this.playerList.splice(i,1);
        }
      }
    return false;
  }
  this.$room = function(val){
    if(typeof val == "number")
      for(var i in this.roomList){
        if(this.roomList[i].id == val){
          return this.roomList[i];
        }
      }
    else if(typeof val == "object")
      for(var i in this.roomList){
        if(this.roomList[i].socket == val.id){
          return this.roomList[i];
        }
      }
    return false;
  }
  this.$delRoom = function(val){
    if(typeof val == "number")
      for(var i in this.roomList){
        if(this.roomList[i].id == val){
          return this.roomList.splice(i,1);
        }
      }
    else if(typeof val == "object")
      for(var i in this.roomList){
        if(this.roomList[i].holder.socket == val.id){
          return this.roomList.splice(i,1);
        }
      }
    return false;
  }
}
module.exports = GameSever;
