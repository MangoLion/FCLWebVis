const { io } = require('../app')
const getAllExports = require('../helpers/getAllExports')
const samples = require('./helpers/storage/samples/sample')
const allEventHandlers = getAllExports(__dirname, ['helpers'])

// https://socket.io/docs/emit-cheatsheet/
/**
 * Forward client connection and events to their proper event handlers
 */

let current_socket = null
io.on('connection', (socket) => {
  console.log(`+ ${socket.id}`)

  let storage = {}

  socket.emit('samples', samples)
  
  allEventHandlers.forEach((eventHandler) => 
  {
    current_socket = socket
    eventHandler(socket, storage)})

  socket.on('disconnect', () => {
    console.log(`- ${socket.id}`)
  })

  socket.on('get workspace', (data) => {
    samples.readSample(data.name, function(err,msg) {
      socket.emit('load workspace', msg)
    })
  })
})



process.on('uncaughtException', function(err) {
  /*setTimeout(function() {
    current_socket.emit('error', 'Critical server exception: ' + err)
  }, 100)*/
  //
  console.log('Caught exception: ' + err)
})