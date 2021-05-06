const express = require('express');
const app = express();
const cors = require('cors')
app.use(cors()) // Allow cross origin


const http = require('http');
const server = http.createServer(app);
const Server = require("socket.io");
const io = new Server(server);


server.listen(5001, () => {
  console.log('LB listening on *:5001');
});

//const io = require("socket.io")(5001);
//console.log("socketio listening on 5001" )
//const io = new ioio(3000);//io.listen(3000);

io_list = [];
rrcounter = 0;

io.on("connection", function(socket) {
  console.log("user connected");
  //socket.emit("welcome", "welcome man");

  socket.on('register', function(data, ack){
    socket.io_data = data;
    const {id, IPaddr, port, users} = data;
    console.log("Registered io " + id);
    io_list.push({id, IPaddr, port, users});
    ack();
  })

  socket.on('disconnect', function(){
    io_list = io_list.filter(io=>{
      return io.id != socket.io_data.id;
    })
  })

});

function get_next_available_server(){
  if (io_list.length == 0)
    return "";
  var io = io_list[rrcounter % io_list.length];
  var url = "http://" + io.IPaddr  + ":" + io.port + "/";
  return url;
}

//connect with load balancer
/*const LBClient = require('socket.io-client').connect('http://localhost:5001')
console.log('connecting to LB')
//id, IPaddr, port, users
LBClient.once('connect', () => {
  console.log('connected to LB')
  LBClient.emit('register', {
    id: 'ID',
    IPaddr: 'localhost', 
    port: 5001, 
    users: {}
  }, () => {console.log('Registered with load balancer')})
})*/

module.exports={
  io, io_list, get_next_available_server
}