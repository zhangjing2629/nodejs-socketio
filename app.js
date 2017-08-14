//引入程序包
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//设置日志级别
io.set('log level', 1); 

//WebSocket连接监听，监听客户端链接，回调函数会传递本次连接的socket
io.on('connection', function (socket) {
  socket.emit('open');//给该socket的客户端发消息，通知客户端已连接

  // 打印握手信息
  // console.log(socket.handshake);

  // 构造客户端对象
  var client = {
    socket:socket,
    name:false
  }

  // 监听客户端发送的消息，对message事件的监听
  socket.on('message', function(msg){
    var obj = {time:getTime()};

    // 判断是不是第一次连接，以第一条消息作为用户名
    if(!client.name){
        client.name = msg;
        obj['text']=client.name;
        obj['author']='System';
        obj['type']='welcome';
        console.log(client.name + ' login');

        //返回欢迎语
        socket.emit('system',obj);
        //广播新用户已登陆，给除了自己以外的客户端广播消息
        socket.broadcast.emit('system',obj);
     }else{

        //如果不是第一次的连接，正常的聊天消息
        obj['text']=msg;
        obj['author']=client.name;      
        obj['type']='message';
        console.log(client.name + ' say: ' + msg);

        // 返回消息（可以省略）
        socket.emit('message',obj);
        // 广播向其他用户发消息
        socket.broadcast.emit('message',obj);
      }
    });

    //监听出退事件
    socket.on('disconnect', function () {  
      var obj = {
        time:getTime(),
        // color:client.color,
        author:'System',
        text:client.name,
        type:'disconnect'
      };

      // 广播用户已退出
      socket.broadcast.emit('system',obj);
      console.log(client.name + 'Disconnect');
    });

});

//express基本配置
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.use(express.static(path.join(__dirname, 'public')));


// 指定webscoket的客户端的html文件
app.get('/', function(req, res){
  res.sendfile('views/chat.html');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

