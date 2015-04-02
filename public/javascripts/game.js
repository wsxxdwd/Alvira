function Game(){
  var _this = this;

  //playerInfo
  this.playerName = "匿名的死基佬";
  this.playerColor = "blue";
  this.playerId = null;
  //room info
  this.roomId = -1;
  this.gameStatus = "free";//空闲

  //websocket
  this.socket = null;
  
  this.register = function(){
    this.socket.emit("register",{name:this.playerName,color:this.playerColor});
  }
  this.createRoom = function(name,callback){
      if(this.playerId && this.gameStatus == "free"){
        this.socket.emit("hold_game",{id:_this.playerId,name:name});
        callback(true);
      }else{
        callback(false);
      }
  };
  this.joinRoom = function(){
    if(this.playerId && this.roomId && this.gameStatus == "free"){
      this.socket.emit("join_game",{roomId:_this.roomId,playerId:_this.playerId});
    }else{
      alert("无法加入游戏")
    }
  }
  this.ready = function(){
    this.socket.emit("ready_game",{roomId:_this.roomId,playerId:_this.playerId});
  }
  this.start = function(){
    if(this.currentRoom.holder.id == this.playerId)
      if(this.currentRoom.status == "ready")
        this.socket.emit("start_game",{roomId:_this.roomId,playerId:_this.playerId});
      else
        alert("玩家未全部准备就绪")
  }
  this.playerAction = function(action){
    if(action == "chahua"){
      this.socket.emit("action",{action:"chahua",playerId:this.playerId,roomId:this.currentRoom.id});
    }else{
      this.socket.emit("action",{action:"direction",direction:action,playerId:this.playerId,roomId:this.currentRoom.id});
    }
  }
  this.leftRoom = function(){
    if(this.playerId && this.roomId){
      this.socket.emit("left_game",{roomId:_this.roomId,playerId:_this.playerId});
      this.roomId = -1;
      this.gameStatus = "free";
      this.refreshRoomList();
      $("#roomList ul li").removeClass("select");
    }
  }
  this.refreshRoomList = function(){
    this.socket.emit("roomList",{});
  };
  this.connectSever = function(){
    this.socket = io();
    return true;
  };
  this.initListener = function(){
    if(!this.socket){
      return false;
    }
    this.socket.on("reg_response",function(data){
      if(data.id){
        console.log("注册成功，id：" + data.id)
        _this.playerId = data.id;
      }else{
        alert(data.msg)
      }
    });
    this.socket.on("roomList",function(data){
      showRoomList(data.list)
    });
    this.socket.on("create_room_response",function(data){
      if(data.id){
        console.log("创建房间成功，id : " + data.id);
        _this.roomId = data.id;
      }else{
        alert(data.msg);
      }
    });
    this.socket.on("room_info",function(data){
      if(data.status){
        console.log("加入房间:"+data.room.name);
        _this.currentRoom = data.room;
        _this.gameStatus = "wait";
        showGame(_this);
      }else{
        alert(data.msg);
      }
    });
    this.socket.on("update_room_info",function(data){
      _this.currentRoom = data.room;
      showPlayerList(_this);
    });
    this.socket.on("room_msg",function(data){
      addMsg(data);
    });
    this.socket.on("game_start",function(data){
      _this.gameStatus = "play";
      console.log("zybsb");//你看不到我你看不到我
    });
    this.socket.on("game_stop",function(data){
      _this.gameStatus = "wait";
    });
    this.socket.on("room_close",function(data){
      alert("房间已关闭");
      showLobby(_this);
      _this.roomId = -1;
      _this.gameStatus = "free";
      $("#roomList ul li").removeClass("select");
      _this.refreshRoomList();
    });
    this.socket.on("gameData",function(data){
      drawSnakes(data.snakes,_this);
      drawFoods(data.foods);
    });
    this.socket.on("chahua",function(data){
      showChahua();
    });
  }
  this.init = function(){
    this.connectSever();//建立连接
    this.initListener();//开始侦听
    this.refreshRoomList();//刷新房间列表
  }
}