$(document).ready(function(){
  //初始化游戏
  game = new Game();
  game.init();
  drawBackground();
  //改变玩家颜色
  $("select").change(function(){
    var color = $(this).val();
    $("#current_color").css("background",color);
    game.playerColor = color;
  });
  //改变玩家名字
  $("#register").click(function(){
    var name = $("#username").val();
    if(name.trim().length == 0){
      alert("请输入用户名");
      return;
    }
    game.playerName = name;
    $("#display_name").html(name);
    game.register();
  });
  //创建房间
  $("#create").click(function(){
    var name = $("#new_room_name").val();
    if(name.trim().length == 0){
      alert("请输入房间名");
      return;
    }
    game.createRoom(name,function(data){
      if(!data){
        alert("创建失败");
      }
    });
  });
  $("#join").click(function(){
    game.joinRoom();
  });
  $("#roomList ul").on("click","li",function(){
    game.roomId = $(this).data().id; 
    $(this).addClass("select");
  });
  $("#back").click(function(){
    showLobby();
    game.leftRoom();
  });
  $("#refresh").click(function(){
    game.refreshRoomList();
  });
});
function showGame(){
  $("#lobby").hide();
  $("#game").show();
  $("#room_name span").html(game.currentRoom.name);
  showPlayerList();
}
function showLobby(){
  $("#lobby").show();
  $("#game").hide();
}

function drawBackground(){
  var canvas = $('#background')[0];
  var context = canvas.getContext('2d');
  context.clearRect(0,0,500,500);
  for(var i=1;i<25;i++){
     context.moveTo(20*i,0);
     context.lineTo(20*i,500);
     context.moveTo(0,20*i);
     context.lineTo(500,20*i);
  }
  context.stroke();  
}
function showPlayerList(){
  var html = "<li>玩家列表:</li>";
  var players = game.currentRoom.players;
  for(var i in players){
        html += '<li><span class="player_name">'+players[i].name+'</span><span class="player_status '+players[i].status+'">'+players[i].status+'</span></li>'
      }
  $("#player_list").html(html);

}
function addMsg(data){
  var html = '<div class="msg"><span class="from>'+data.from+'</div><div class="content">'+data.content+'</div></div>'
  $("#msg_box").append(html);
}