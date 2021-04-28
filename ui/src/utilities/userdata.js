let workspaces = [];
let setWorkspaces = function(workspaces_){
  //alert(workspaces_)
  workspaces = workspaces_;
}

let getWorkspaces = function(){
  return workspaces
}
module.exports = {setWorkspaces, getWorkspaces}