$(document).ready(function(){
  var socket = io();
  socket.emit('total', '');
  socket.emit('wait', '');
  socket.on('total', function(total){
    $('#total span').text(total);
  });
  socket.on('wait', function(num){
    $('#wt span').text(num);
  });

  socket.on('reqresult', function(data){
    if(data.status === 1){
      socket.emit('wait', ''); //从新获取可聊天人数

      $('#contents').append('<div class="conitem"><div class="hd"><strong>系统消息</strong><span>'+ now() +'</span></div><div class="bd">'+ '对方同意了你的聊天请求。' +'</div></div>');

      $('#src').val(data.srcId);

      $('#break').removeClass('hide');
      $('#concat').addClass('hide');

      $('#send').on('click', function(){
        var txt = $('#msg').val();
        if(txt){
          var str = '<div class="conitem me"><div class="hd"><strong>我</strong><span>'+ now() +'</span></div><div class="bd">'+ txt +'</div></div>'
          $('#contents').append($(str));
          
          socket.emit('aconnect', {
            srcId: $('#src').val(),
            msg: txt
          });
          $('#msg').val('');
        }
      });

    }else{
      $('#contents').append('<div class="conitem"><div class="hd"><strong>系统消息</strong><span>'+ now() +'</span></div><div class="bd">'+ '对方拒绝了你的聊天请求。' +'</div></div>');
    }
  });

  socket.on('reqchat', function(data){
    var c = confirm('茫茫人海中，遇见了你。\n你同意和对方聊天吗？');
    if(c == true){  //同意
      socket.emit('wait', ''); //从新获取可聊天人数

      $('#src').val(data.srcId);
      socket.emit('reqresult', {
        srcId: data.srcId,
        result: 1
      });

      $('#break').removeClass('hide');
      $('#concat').addClass('hide');
      
      $('#send').on('click', function(){
        var txt = $('#msg').val();
        if(txt){
          var str = '<div class="conitem me"><div class="hd"><strong>我</strong><span>'+ now() +'</span></div><div class="bd">'+ txt +'</div></div>'
          $('#contents').append($(str));
          
          socket.emit('aconnect', {
            srcId: $('#src').val(),
            msg: txt
          });
          $('#msg').val('');
        }
      });
    }else{
      socket.emit('reqresult', {
        srcId: data.srcId,
        result: 0
      });
    }
  });

  socket.on('aconnect', function(msg){
    var str = '<div class="conitem you"><div class="hd"><strong>路人甲</strong><span>' + now() + '</span></div><div class="bd">' + msg + '</div></div>'
    $('#contents').append($(str));
  });

  $('#concat').on('click', function(){
    socket.emit('reqchat', '');
  });

  socket.on('breakchat', function(data){
    if(data.status == 1){
      $('#src').val('');
      $('#contents').append('<div class="conitem"><div class="hd"><strong>系统消息</strong><span>'+ now() +'</span></div><div class="bd">'+ '对方断开了链接。' +'</div></div>');
    }

    socket.emit('wait', ''); //从新获取可聊天人数

    $('#concat').removeClass('hide');
    $('#break').addClass('hide');
  });

  $('#break').on('click', function(){
    var srcId = $('#src').val();
    $('#src').val('');
    socket.emit('breakchat', {
      srcId: srcId
    });

    socket.emit('wait', ''); //从新获取可聊天人数

    $('#concat').removeClass('hide');
    $('#break').addClass('hide');
  });

  function now(){
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
  }
});