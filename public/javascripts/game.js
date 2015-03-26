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
  this.leftRoom = function(){
    if(this.playerId && this.roomId && this.gameStatus != "free"){
      this.socket.emit("left_game",{roomId:_this.roomId,playerId:_this.playerId});
      this.roomId = -1;
      this.gameStatus = "free"
      $("#roomList ul li").removeClass("select");
      console.log(1)
    }
  }
  this.refreshRoomList = function(){
    this.socket.emit("roomList",{});
  }
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
      var html = "";
      for(var i in data.list){
        html += '<li class="" data-id="'+data.list[i].id+'"><span>'+data.list[i].name+'</span><span>'+data.list[i].players.length+'/4</span></li>'
      }
      $("#roomList ul").html(html);
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
        showGame();
      }else{
        alert(data.msg);
      }
    });
    this.socket.on("update_room_info",function(data){
      console.log("update")
      _this.currentRoom = data.room;
      showPlayerList();
    });
    this.socket.on("room_msg",function(data){
      console.log("msg")
      addMsg(data);
    });
  }
  this.init = function(){
    this.connectSever();//建立连接
    this.initListener();//开始侦听
    this.refreshRoomList();//刷新房间列表
  }
}