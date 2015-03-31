//和我一起念先有插花后有天
var chahua = false;//全局插花
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
    alert('我不会告诉你选颜色并没有什么用,只是想强调下你是基佬而已');
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
  $("#ready").click(function(){
    game.ready();
  });
  $("#start").click(function(){
    game.start();
  });
  $("#refresh").click(function(){
    game.refreshRoomList();
  });
  $(document).keydown(function keyDown(e){
    if(!game){
      return false;
    }
    if(game.gameStatus == "play")
      switch(e.which){
        case 71: game.playerAction("chahua");break;//空格
        case 37: game.playerAction("left");break;
        case 38: game.playerAction("up");break;
        case 39: game.playerAction("right");break;
        case 40: game.playerAction("down");break;
    }
  });
});

function showGame(){
  $("#lobby").hide();
  $("#game").show();
  $("#room_name span").html(game.currentRoom.name);
  if(game.currentRoom.holder.id == game.playerId){
    $("#start").show();
  }else{
    $("#start").hide();
  }
  showPlayerList();
}
function showLobby(){
  $("#lobby").show();
  $("#game").hide();
  game.refreshRoomList();
}
function showRoomList(list){
   var html = "";
    for(var i in list){
      html += '<li class="" data-id="'+list[i].id+'"><span>'+list[i].name+'</span><span>'+list[i].players.length+'/'+list[i].maxPlayer+'</span></li>'
    }
    $("#roomList ul").html(html);
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
  if(game.currentRoom){
    var players = game.currentRoom.players;
    for(var i in players){
      html += '<li><span class="player_name">'+players[i].name+'</span><span class="player_status '+players[i].status+'">'+players[i].status+'</span></li>'
    }
  }
  $("#player_list").html(html);

}
function addMsg(data){
  var html = '<div class="msg"><span class="from>'+data.from+'</div><div class="content">'+data.content+'</div></div>'
  $("#msg_box").append(html);
}
function drawSnakes(snakes){
  var canvas = $('#snake_canvas')[0];
  var context = canvas.getContext('2d');
  context.clearRect(0,0,500,500);
  for(var i in snakes){
    var snake = snakes[i];
    if(snake.status == "alive"){//不显示死蛇
      if(snake.playerId == game.playerId)
        context.fillStyle = game.playerColor;
      else
        context.fillStyle = "red";
      for(var j in snake.body){
        var section = snake.body[j];
        context.fillRect(section[0]*20,section[1]*20,20,20);
      }
    }
  }
}
function drawFoods(foods){
  var canvas = $('#object_canvas')[0];
  var context = canvas.getContext('2d');
  context.clearRect(0,0,500,500);
  for(var i in foods){
    context.fillStyle = "green";
    context.fillRect(foods[i][0]*20,foods[i][1]*20,20,20);
  }
}
function showChahua(){
  if(!chahua){
    chahua = true;
    $("#chahua").show();
    setTimeout(function(){
      $("#chahua").hide();
      chahua = false;
    },500);
  }
}