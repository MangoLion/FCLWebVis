const http = require('http')
//const https = require('https')
const app = require('express')()

// Uses cors
const cors = require('cors')
app.use(cors()) // Allow cross origin

// Use routes
const routes = require('./routes')
routes.map((route) => app.use('/', route))

const fs = require('fs')

//console.log(fs.readFileSync('server.key', 'utf8'))
// Create server
/*const server = https.createServer({
  key: fs.readFileSync('server.key', 'utf8'),
  cert: fs.readFileSync('server.cert', 'utf8')
}, app)*/
const server = http.createServer(app)
// Use socket with server
const io = require('socket.io')(server,{
  pingTimeout:150000,
  /*handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': req.headers.origin, //or the specific origin you want to give access to,
      'Access-Control-Allow-Credentials': true
    }
    res.writeHead(200, headers)
    res.end()
  }*/
})
//io.origins('*:*') 
io.set('origins', '*:*')

//connect with load balancer
const LBClient = require('socket.io-client').connect('http://localhost:5001')
console.log('connecting to LB')
//id, IPaddr, port, users
LBClient.on('connect', () => {
  console.log('connected to LB')
  LBClient.emit('register', {
    id: 'ID',
    IPaddr: 'localhost', 
    port: 3000, 
    users: {}
  }, () => {console.log('Registered with load balancer')})
})


module.exports = {
  io,
  server,
  LBClient
}

