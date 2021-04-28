import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './components/App'

import set_loaded from './redux/actions/SetAlreadyLoaded'
import remove_file from './redux/actions/RemoveFile'

import { Provider } from 'react-redux'
import set_field from './redux/actions/SetField'
import load_workspace from './redux/actions/loadWorkspace'
import call_render from './redux/actions/RenderCall'
import set_file from './redux/actions/SetFile'
import set_center from './redux/actions/SetCenter'
import set_progress from './redux/actions/SetProgress'
import set_file_content from './redux/actions/SetFileContent'
import {initSocketIO, getIoInstance} from './utilities/ioInstance'
import initializeStore from './redux/middleware/InitStore'

import {setSamples} from './utilities/sample'
import { toast } from 'react-toastify'
import ErrorBoundary from 'components/model/core/ErrorBoundary'
import {setWorkspaces} from './utilities/userdata'

const BJSON = require('buffer-json')
//connect to socketIO server
initSocketIO()

//Main redux store that holds the entire client's state, storing all data
const store = initializeStore();

let search = window.location.search;
let params = new URLSearchParams(search);
let username = params.get('user');
if (!username){
  alert("Error: login is missing. Please login from the main page!");
  window.location.href = 'http://localhost:5000/';
}

window.history.replaceState({}, document.title, "/");

getIoInstance().emit('login', username);

getIoInstance().on('samples', function(data) {
  toast.success('Server Connection Established',{autoClose: 2000})
  setSamples(data.samples)
  setWorkspaces(data.workspaces)
  store.dispatch(call_render())
})

getIoInstance().on('load user workspace', function(workspace) {
  store.dispatch(set_progress({
    sending: 0,
    processing: 0,
    receiving: 0
  }))
  let state = BJSON.parse(workspace)
  state.dontSnapshot = true;
  store.dispatch(load_workspace(state))
  store.dispatch(set_file({
    name:state.file_current_name
  }))
})

getIoInstance().on('load workspace', function(workspace) {
  store.dispatch(set_progress({
    sending: 0,
    processing: 0,
    receiving: 0
  }))
  let state = JSON.parse(workspace)
  store.dispatch(load_workspace(state))
  store.dispatch(set_file({
    name:state.file_current_name
  }))
})

getIoInstance().on('error', function(msg) {
  toast.error(msg)
})

getIoInstance().on('disconnect', function(reason) {
  toast.error('Lost connection! Switching to snapshot mode')
  toast.error('disconnect reason: ' + reason)
  store.dispatch(set_progress({
    sending: 0,
    processing: 0,
    receiving: 0
  }))
  store.dispatch(load_workspace())
  store.dispatch(call_render())
  //window.location.reload(false)
})

//The "results" event indicates that the server has returned the result of the current task
getIoInstance().on('results', function(msg) {
  if (msg.is_error) {
    toast.error(msg.response)
    return
  }

  store.dispatch(set_loaded())
  for (let varName in msg) {
    //console.log(msg)
    if (varName == 'is_error' || varName == 'response')
      continue
    if (varName !== 'fileContent') {
      //console.log('received: ' + varName + JSON.stringify(msg[varName]))
      store.dispatch(set_field({
        name: varName,
        value: msg[varName],
        isFileInput: true
      }))

      if (varName == 'data_range') {
        var ranges = msg[varName]
        var center = [
          (ranges[1] - ranges[0])/2,
          (ranges[3] - ranges[2])/2,
          (ranges[5] - ranges[4])/2
        ]
        store.dispatch(set_center(center))
      }
    }else{
      //console.log('received: ' + msg['fileContent'])
      store.dispatch(set_file_content({
        content: msg['fileContent']
      }))
      
    }
  }

  store.dispatch(call_render())
})

getIoInstance().on('*', function() {
  // listen to any and all events that are emitted from the
  // socket.io back-end server, and handle them here.

  // is this possible? how can i do this?
})

getIoInstance().on('progress', function(msg) {
  console.log(msg)
  if (msg.error) {
    toast.error(msg.error,{autoClose: 10000})
    store.dispatch(remove_file())
    store.dispatch(set_progress({
      sending: 0,
      processing: 0,
      receiving: 0
    }))
    return
  }
  store.dispatch(set_progress({
    ...msg
  }))
  //reset progress to 0
  if (msg.receiving === 100)
    setTimeout(function() { 
      store.dispatch(set_progress({
        sending: 0,
        processing: 0,
        receiving: 0
      }))
    }, 1000)
})

ReactDOM.render(
  <Router>
    
    <Provider store={store}>
      <App />
    </Provider>
    <a id="downloadAnchorElem" href='blank' style={{display:'none'}}>!</a>
  </Router>,
  document.getElementById('root')
)
