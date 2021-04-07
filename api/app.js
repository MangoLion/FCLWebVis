const http = require('http')
const app = require('express')()

// Uses cors
const cors = require('cors')
app.use(cors()) // Allow cross origin

// Use routes
const routes = require('./routes')
routes.map((route) => app.use('/', route))

// Create server
const server = http.createServer(app)

// Use socket with server
const io = require('socket.io')(server,{
  pingTimeout:150000
})

module.exports = {
  io,
  server,
}
