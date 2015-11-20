var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var total = 0;
var waitSocket = [];  //未分配的 socket

io.on('connection', function(socket){
  total ++;
  // console.log('连接后：' + total);

  waitSocket.push(socket);

  socket.on('total', function(){
    io.emit('total', total);
  });
  
  socket.on('wait', function(){
    io.emit('wait', waitSocket.length+'');
  });

  socket.on('disconnect', function(){
    total --;
    socket.broadcast.emit('total', total);
    waitSocket.forEach(function(s, index){
      if(s.id === socket.id){
        waitSocket.splice(index, 1);
      }
    });
    // console.log('离线后：'+total);
  });

  socket.on('reqchat', function(){
    var random = parseInt(Math.floor(Math.random() * (waitSocket.length-1))); //-1 是减去本身
    waitSocket.forEach(function(s, index){
      if(s.id === socket.id){
        waitSocket.splice(index, 1);  //删除本身
        var ysocket = waitSocket[random];
        waitSocket.splice(random, 1); //删除匹配
        ysocket.emit('reqchat', {
          srcId: socket.id
        });
      }
    });
  });

  socket.on('reqresult', function(data){
    if(data.result === 1){
      io.sockets.sockets.map(function(e){
        if(e.id == data.srcId){
          e.emit('reqresult', {
            srcId: socket.id,
            status: 1
          });
        }
      });
    }else{
      io.sockets.sockets.map(function(e){
        if(e.id == data.srcId){
          e.emit('reqresult', {
            srcId: socket.id,
            status: 0
          });
        }
      });
    }
  });

  socket.on('aconnect', function(data){
    var sId = data.srcId;
    var msg = data.msg;

    io.sockets.sockets.map(function(e){
      //console.log(e.id);
      if(e.id == sId){
        e.emit('aconnect', msg);
      }
    });
  });

  socket.on('breakchat', function(data){
    waitSocket.push(socket);  //从新添加进等待数组

    io.sockets.sockets.map(function(e){
      if(e.id == data.srcId){
        waitSocket.push(e);
        e.emit('breakchat', {
          status: 1
        });
      }
    });
    
  });
});

http.listen(80, function(){
  console.log('listening on *:80');
});