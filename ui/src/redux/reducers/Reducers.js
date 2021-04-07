import { FIELD_SET } from '../actions/SetField'
import { FILE_SET } from '../actions/SetFile'
import { FILE_REMOVE } from '../actions/RemoveFile'
import { PROGRESS_SET } from '../actions/SetProgress'
import { CALL_RENDER } from '../actions/RenderCall'
import { TASK_ADD } from '../actions/AddTask'
import { FILE_ADD } from '../actions/AddFile'
import { FILE_SET_CONTENT } from '../actions/SetFileContent'
import { LOADED_SET } from 'redux/actions/SetAlreadyLoaded'
import { RENDER_CHECK } from '../actions/CheckRender'
import { CENTER_SET } from '../actions/SetCenter'
import { WORKSPACE_LOAD } from '../actions/loadWorkspace'
import { SET_TREE } from '../actions/SetTree'
import { VIEW_SET } from '../actions/SetView'
import { applyFileType, getFileType } from '../../utilities/fileTypes'
import { applyTaskType, getTaskType } from '../../utilities/taskTypes'
import { toast } from 'react-toastify'

/**
 * TODO:
 *  - Put all variables with doReuse = true into a new shared fields, the corresponding field in the state's fields (representing the task's fields) should hold a reference to the shared variable
 */

/**
 * This reducer populate the fields map object within the redux state
 * @param {*} fields a map object, key is variable name, value is an object whose attributes belong to the variable (value of variable, sentToServer, doRender, ...) 
 * @param {*} action the action received
 */
/* function field_reducer (fields, action) {
  switch (action.type) {
  //Called on store and task initialize, update fields with the task's fields
  case 'init':
    return {
      ...action.fields
    }

  //Called when one of the input compoments change value to update the value (or other attributes) of the field in fields
  case FIELD_SET:

    return {
      ...fields,
      [action.field.name]: {
        ...fields[action.field.name],
        ...action.field
      }
    }

  default:
    return fields
  }
} */

/**
 * Search for the file with the name and replace with the new contents
 * @param {*} parent 
 * @param {*} name 
 * @param {*} replace 
 */
function recursiveNameSearchNReplace(parent, name, replace) {
  for (let name_ in parent.children) {
    if (name_ === name) {
      parent.children[name_] = replace
      //console.log("repalced")
      //console.log(parent.children[name_])
      return true
    }
    else if (parent.children[name_].children) {
      let result = recursiveNameSearchNReplace(parent.children[name_], name, replace)
      if (result)
        return true
    }
  }

  return false
}

/**
 * Return the reference to the file object with the name
 * @param {*} parent the current file whose children will be searched
 * @param {*} name the name of the file to be searched for
 */
function recursiveNameSearch(parent, name) {
  for (let name_ in parent.children) {
    if (name_ === name) {
      ///HACK!!! SET PARENT FILE REF
      parent.children[name_].parentFile = parent
      return parent.children[name_]
    }
    else if (parent.children[name_].children) {
      let recursive_result = recursiveNameSearch(parent.children[name_], name)
      if (recursive_result)
        return recursive_result
    }
  }

  return null
}

const setColorMap = (file) => {
 
  //console.log('setting')
  //console.log(file)
  if (file.fileFields.color_scheme && file.fileFields.point_data_min && file.fileFields.point_data_max) {
    //console.log('set color map')
    //console.log(file.fileFields)
    file.colorMap={
      type: file.fileFields.color_scheme.value,
      min: file.fileFields.point_data_min.value,
      max: file.fileFields.point_data_max.value,
    }
    //alert('color map set')
  }
}

//to be reused in FILE_SET and RENDER_CHECK and file add
const file_set = (state, fileName) => {
  if (recursiveOrthoSearch(state) && state.viewType != 'orthographic') {
    state.viewType = 'orthographic'
  }
  
  state.file_current_name = fileName
  let new_state = { ...state }
  if (new_state.file_current)
    recursiveNameSearchNReplace(new_state, new_state.file_current.name, new_state.file_current)
  //console.log("replacing: " + );
  let file_ref = recursiveNameSearch(state, fileName)
  if (!file_ref) {
    if (fileName !== 'Directory')
      alert('error: file ' + fileName + ' not found!')
    return state
  }
  var data_range = file_ref.fileFields.data_range
  if (!data_range && file_ref.parentFile && file_ref.parentFile.id != 'root') {
    console.log(file_ref.parentFile)
    data_range = file_ref.parentFile.fileFields.data_range
  }
  if (data_range) {
    var ranges = data_range.value
    var center = [
      (ranges[1] - ranges[0])/2,
      (ranges[3] - ranges[2])/2,
      (ranges[5] - ranges[4])/2
    ]
    new_state.center = center
  }
  console.log(data_range)
  console.log('new center:')
  console.log(center)

  if(file_ref.fileFields.color_scheme)
    setColorMap(file_ref)

  
  return {
    ...new_state,
    file_current: file_ref
  }
}


const recursiveParentAdd = (file) => {
  for (var name in file.children) {
    var child = file.children[name]
    child.parentFile = file
    recursiveParentAdd(child)
  }
}

const recursiveOrthoSearch = (parent) => {
  let enableOrtho = false
  if (parent.doRender && getFileType(parent.fileType).enableOrtho)
    enableOrtho = true
  for(let fileName in parent.children) {
    let file = parent.children[fileName]
    if (file.doRender) {
      if (getFileType(file.fileType).enableOrtho)
        enableOrtho = true
    }
    if (file.children) {
      if (recursiveOrthoSearch(file))
        enableOrtho = true
    }
  }
  return enableOrtho
}

/**
 * This is the main reducer, it performs all of the major functions
 * @todo update the details of this reducer
 * @param {*} state 
 * @param {*} action 
 */
const task_app = (
  state = {
    id: 'root',
    name: 'root',
    file_current: null,
    file_current_name: false,
    render_count: 0,
    children: {},
    center:[0,0,0],
    task_params_changed:false,
    progress: {
      sending: 0,
      processing: 0,
      receiving: 0
    },
    openItems:['root'],
    viewType:'perspective',
    snapshotMode: false
  },
  action) => {
  switch (action.type) {
  case FILE_REMOVE:
    delete state.children[state.file_current.id]
    state.file_current=null
    return state
  case VIEW_SET:
    var orthoRequired = recursiveOrthoSearch(state)

    if (orthoRequired && action.viewType != 'orthographic') {
      toast.error('error: one or more visible items require the orthopgraphic view')
      return state
    }
    return{
      ...state,
      render_count:state.render_count++,
      viewType:action.viewType
    }
  case SET_TREE:
    return{
      ...state,
      openItems:action.openItems
    }
  case CENTER_SET:

    return {
      ...state,
      center:action.center
    }
  case WORKSPACE_LOAD:
    if (action.state) {
      recursiveParentAdd(action.state)
      file_set (action.state, action.state.file_current_name)
    }else action.state= state
    action.state.snapshotMode = true
    document.getElementById('snapshot').style.display = 'block'
    //console.log('LOADING WS')
    //console.log(action.state)
    return action.state

  //set the doRender attribute, when the user clicks on the checkbox in TreeWindow
  case RENDER_CHECK: {

    

    let new_state
    //if not current file, has to switch to current file
    if (!state.file_current || state.file_current.fileName !== action.fileName) {
      new_state = file_set(state, action.fileName)
    } else
      new_state = { ...state }
    new_state.file_current.doRender = !new_state.file_current.doRender
    new_state.render_count ++

    if (recursiveOrthoSearch(new_state) && new_state.viewType != 'orthographic') {
      new_state.viewType = 'orthographic'
      //alert('switch')
    }

    return new_state
  }

  //tells all visualizers to update because user clicked Render button
  case CALL_RENDER: {
    
    return {
      ...state,
      render_count: state.render_count + 1
    }
  }

  //set the state of the file to loaded to tell the client that the server already has this file
  case LOADED_SET: {
    let new_state = { ...state }
    new_state.file_current.alreadyLoaded = true
    return new_state
  }

  //set the content of the file based on the results sent from the server
  case FILE_SET_CONTENT: {
    let new_state = {
      ...state,
      file_current: {
        ...state.file_current,
        fileContent: action.file.content
      }
    }
    new_state.render_count ++
    recursiveNameSearchNReplace(new_state, new_state.file_current.id, new_state.file_current)
    //file_set(new_state, state.file_current.fileName);
    return new_state
  }

  //add a new task to the currently selected file. Then set the new result file from this task as the currently selected file.
  case TASK_ADD: {
    if (!state.file_current) {
      alert('No file selected!')
      return state
    }
    applyTaskType(action.task, action.task.taskType)
    let taskObj = getTaskType(action.task.taskType)
    applyFileType(action.task, taskObj.outputFileType)
    let file = state.file_current
    for (var f in file.fileFields) {
      if (file.fileFields[f].passToChildren) {
        if (action.task.fileFields[f]) {
          action.task.fileFields[f] = {
            ...action.task.fileFields[f],
            value: file.fileFields[f].value
          }
        }
      }
    }
    if (taskObj.init)
      taskObj.init(file, action.task.taskFields)
    let new_state = { ...state }
    new_state.task_params_changed=true
    new_state.file_current = {
      ...state.file_current,
      children: {
        ...state.file_current.children,
        [action.task.name]: {
          id: action.task.name,
          ...action.task
        }
      }
    }
    recursiveNameSearchNReplace(new_state, new_state.file_current.id, new_state.file_current)
    return file_set (new_state, action.task.name)
  }

  //add a new file
  case FILE_ADD: {
    state.openItems.push(action.file.name)
    applyFileType(action.file, action.file.fileType)
    var new_state = {
      ...state,
      children: {
        ...state.children,
        [action.file.name]: {
          //filetype, content
          id: action.file.name,
          children: [],
          ...action.file
        }
      },
      openItems:state.openItems
    }
    new_state.task_params_changed=true
    return file_set (new_state, action.file.name)

  }

  //set the file as the currently selected file
  case FILE_SET: {
    //update current_task into tree
    /*if (state.task_current !== null){
                  let task_old = recursiveNameSearch(state, state.task_current.name);
                  if (task_old){
                      for (let key in state.task_current) {
                          task_old[key] =  state.task_current[key];         
                      }
                  }
              }*/
    return file_set(state, action.file.name)
  }

  //set the value of a variable in the current file
    
  case FIELD_SET: {
    let new_state = { ...state }
    let file = new_state.file_current
    let fields
    if (action.field.fileName) {
      if (!new_state.file_current || new_state.file_current.id != action.field.fileName)
        file = recursiveNameSearch(new_state, action.field.fileName)
    }
    
    if (action.field.isFileInput) {
      fields = file.fileFields
    } else {
      new_state.task_params_changed = true
      fields = file.taskFields
    }
    fields[action.field.name] = {
      ...fields[action.field.name],
      value: action.field.value
    }

    if (fields[action.field.name].passToChildren) {
      for (var c in file.children) {
        if (file.children[c].fileFields[action.field.name]) {
          //console.log('passing')
          //console.log(action.field.value)
          file.children[c].fileFields[action.field.name] = {
            ...file.children[c].fileFields[action.field.name],
            value: action.field.value
          }
        }
      }
    }

    if (action.field.name == 'color_scheme' || action.field.name=='point_data_max' || action.field.name=='point_data_min') {
      setColorMap (new_state.file_current)
      new_state.render_count ++
    }

    if (new_state.file_current && new_state.file_current.doRender && !fields[action.field.name].manual_update)
      new_state.render_count ++
    return new_state
  }


  case PROGRESS_SET: {
    
    return {
      ...state,
      task_params_changed:false,
      progress: {
        ...state.progress,
        ...action.progress
      }
    }
  }

  default:
    return state
  }
}

export default task_app