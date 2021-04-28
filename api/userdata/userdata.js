const fs = require('fs')
const resourcesPath = '/home/nguyenphan/Insync/thousandlytales@gmail.com/GoogleDrive/FlowVis20/api/userdata'
const BJSON = require('buffer-json')

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

let get_workspaces = (username) => {
  var results =  []
  if (fs.existsSync(`${resourcesPath}/` + username+ '/')) 
    results = getDirectories(`${resourcesPath}/` + username)
  //console.log(results)
  return results
}

let load_workspace = (username, workspace_name, callbackServer, callbackClient) => {
  var userDir = `${resourcesPath}/` + username + '/' + workspace_name +'/'
  fs.readFile(userDir + 'server.ws', 'utf8',callbackServer)
  fs.readFile(userDir + 'client.ws', 'utf8',callbackClient)
}

let save_workspace = (username, workspace_name, getStorage, data_client, callback) => {
  var userDir = `${resourcesPath}/` + username + '/' + workspace_name +'/'
  //console.log(`${resourcesPath}/` + username)
  //console.log(fs.existsSync(`${resourcesPath}/` + username+ '/' + workspace_name))
  if (!fs.existsSync(`${resourcesPath}/` + username)) {
    //console.log('HERE')
    //console.log(`${resourcesPath}/` + username)
    fs.mkdirSync(`${resourcesPath}/` + username)
    
  }
  if (!fs.existsSync(`${resourcesPath}/` + username+ '/' + workspace_name)) {
    //console.log('HERE2')
    fs.mkdirSync(`${resourcesPath}/` + username+ '/' + workspace_name)
  }
  var content = BJSON.stringify(getStorage())
  fs.writeFile(userDir + 'server.ws', content,'utf8', callback)
  content = BJSON.stringify(data_client)
  fs.writeFile(userDir + 'client.ws', content,'utf8',  callback)
}

module.exports = {
  load_workspace, save_workspace, get_workspaces
}