/*
- Starts React App Server (server.js):
	- Starts the Express JS server that will serve the React Application to the client's web browser
	- This application is the main web application for displaying the visualization and user interface

Once loaded to the client's browser, starts a SocketIO client connection to the processing server's SocketIO server
*/

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

//set of clients that disconnected suddenly, dump their workspace here
//and recover their workspace if they relog. TODO: remove workspace dumps after some time (to free memory)
let disconnected_pool = {}

//Tracker to attempt to send server error back to client if server crash, doesn't work yet
let current_socket = null

//when new SocketIO client (from the web app) connects, 
//initialize new client storage for workspace data
//forward them to all relevant IO event handlers (such as new dataset/task input handler)
io.on('connection', (socket) => {
  console.log(`+ ${socket.id}`)

  let storage = {}

  //initialize new client storage for workspace data
  const getStorage = () => {return storage}
  const setStorage = (storage_) => {storage = storage_}

  //check client username for identification
  socket.on('login', (id) => {
    //console.log(id)
    socket.loginID = id
    samples.workspaces = get_workspaces(id)
    socket.emit('samples', samples)

    //incomplete: restore  workspace data if this is a client that has recently crashed/disconnected
    //if (disconnected_pool[id])
    //  storage = disconnected_pool[id]
  })

  //forward them to all relevant IO event handlers (such as new dataset/task input handler)
  allEventHandlers.forEach((eventHandler) => 
  {
    current_socket = socket
    eventHandler(socket, getStorage)})

  socket.on('disconnect', () => {
    console.log(`- ${socket.id}`)
  })

  //web app client wants to save all workspace data to the processing server
  //data is all the workspace data that the client has (this is data for visualization)
  //processing server (here) will save all client workspace data AND server processing data into a new (or override existing) workspace folder with the workspace name
  socket.on('save user workspace', (data, ack) => {
    save_workspace(socket.loginID, data.workspace_name, getStorage, data, () => {
      
    })
    ack()
  })

  //web app client wants to save load workspace data from the processing server
  //processing server load all workspace data for processing into the user data stored on server
  //also sends all workspace data for visualization back to the client
  socket.on('load user workspace', (data) => {
    console.log(data)
    load_workspace(socket.loginID, data.workspace_name, (err,server_data) => {
      setStorage (BJSON.parse(server_data))
    },(err,client_data) => {
      socket.emit('load user workspace', client_data)
    })
    //ack()
  })

  //load sample workspace snapshot (readonly) data to the web app for visualization
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
  //Attempt to send server error back to client if server crash, doesn't work
  /*setTimeout(function() {
    current_socket.emit('error', 'Critical server exception: ' + err)
  }, 100)*/
  //
  console.log('Caught exception: ' + err)
})