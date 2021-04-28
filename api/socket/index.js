const { io } = require('../app')
const getAllExports = require('../helpers/getAllExports')
const samples = require('./helpers/storage/samples/sample')
const allEventHandlers = getAllExports(__dirname, ['helpers'])
const {save_workspace, load_workspace, get_workspaces} = require('../userdata/userdata')
const BJSON = require('buffer-json')

// https://socket.io/docs/emit-cheatsheet/
/**
 * Forward client connection and events to their proper event handlers
 */
let disconnected_pool = {}

let current_socket = null
io.on('connection', (socket) => {
  console.log(`+ ${socket.id}`)

  let storage = {}

  const getStorage = () => {return storage}
  const setStorage = (storage_) => {storage = storage_}

  socket.on('login', (id) => {
    console.log(id)
    socket.loginID = id
    samples.workspaces = get_workspaces(id)
    socket.emit('samples', samples)
    //if (disconnected_pool[id])
    //  storage = disconnected_pool[id]
  })

  

  
  
  allEventHandlers.forEach((eventHandler) => 
  {
    current_socket = socket
    eventHandler(socket, getStorage)})

  socket.on('disconnect', () => {
    console.log(`- ${socket.id}`)
  })

  socket.on('save user workspace', (data, ack) => {
    //console.log(data)
    //console.log(storage['cylinder3D.vtk'].data_range)
    save_workspace(socket.loginID, data.workspace_name, getStorage, data, () => {
      
    })
    ack()
  })

  socket.on('load user workspace', (data) => {
    console.log(data)
    load_workspace(socket.loginID, data.workspace_name, (err,server_data) => {
      //console.log('server_data')
      //console.log(server_data)
      setStorage (BJSON.parse(server_data))
      //Object.assign(storage, ...storage_new)
      //console.log(storage)
    },(err,client_data) => {
      //console.log('client_data')
      //console.log(client_data)
      socket.emit('load user workspace', client_data)
    })
    //ack()
  })

  socket.on('get workspace', (data) => {
    samples.readSample(data.name, function(err,msg) {
      socket.emit('load workspace', msg)
    })
  })

  socket.on('disconnect', () => {
    disconnected_pool[socket.loginID] = getStorage()
  })
})



process.on('uncaughtException', function(err) {
  /*setTimeout(function() {
    current_socket.emit('error', 'Critical server exception: ' + err)
  }, 100)*/
  //
  console.log('Caught exception: ' + err)
})