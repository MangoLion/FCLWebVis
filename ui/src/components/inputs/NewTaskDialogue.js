import React, {useState, useRef} from 'react'
// import set_field from './../../redux/actions/SetField'
// import add_file from './../../redux/actions/AddFile'
import { connect } from 'react-redux'
import {Modal,Button} from 'react-bootstrap'
import {getTaskTypes,getTaskType} from './../../utilities/taskTypes'
// import {getFileNames} from './../../utilities/taskHandler'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import { toast } from 'react-toastify'

/**
 * Opens a dialogue that allow the user to choose a new task that can be applied to the currently selected file (or file as a result from another task)
 * @todo fix the setOpen redundancy
 * @component
 * @prop {function} setOpen a roundabout callback from TreeWindow, if the user manually close this dialogue, let TreeWindow knows. This may seems redundant, but it prevented an endless loop bug when the user close the dialogue.
 * @prop {Boolean} open passed by TreeWindow, true if the user opened this dialogue. (see todo to fix in future)
 * @prop {function} onNewTask callback passed by TreeWindow, called once the user press the Add Task button. TreeWindow will send a new_task redux action
 * @prop {string} fileType passed from mapStatetoProps, is the currently select file's type
 * @prop {string} fileName passed from mapStatetoProps, is the currently select file's name
 * @prop {string[]} allFileNames passed by TreeWindow, is the list of names of all current files (including files as a result of tasks)
 */
let NewTaskDialogue = ({dispatch, addToggle, setOpen, open, onNewTask, fileType, fileName,allFileNames}) => {
  let flag = open
  if (open && !fileType)
    flag = false
  const [show, setShow] = useState(flag)

  /**
   * Close the dialogue
   */
  const handleClose = () => {
    setShow(false)
    setOpen(false)
  }
  /**
   * Legacy func, used to open the dialogue. But now the dialogue's open state is determined by open in props (passed in by TreeWindow)
   */
  /*   const handleShow = () => {
    //get server file list here
    //setFileNames(getFileNames(name));
    setShow(true)
  } */

  /**
   * called when user press AddTask button, use onNewTask callback to pass needed arguments back to TreeWindow, then it will send a new redux action to add new task
   */
  const addNewTask = () => {
    let new_name = document.getElementById('resultInput').value
    if (allFileNames[new_name]) {
      toast.error('File name already exists!')
      return
    }
    onNewTask({
      name: new_name,
      type: selectRef.current.textContent
    })

    addToggle(new_name)
    handleClose()
  }
  
  
  /**
   * reference of task type dropdown
   */
  let selectRef = useRef()

  /**
   * get all task types from taskTypes.js
   */
  let taskTypes = getTaskTypes()
  /**
   * list of MenuItem elements for each task type in the dropdown
   */
  let selectItems = []

  /**
   * first task type is the default option for dropdown
   */
  let firstItem = null

  for (let name in taskTypes) {
    let task = getTaskType(name)
    if (task.inputFileType !== fileType)
      continue

    if (!firstItem)
      firstItem = name
    selectItems.push(<MenuItem key={name} value={name}>{name}</MenuItem>)
  }

  if (open && !fileType) {
    toast.error('No file selected!')
    //setShow(false);
    setOpen(false)
    return null
  }

  if (!firstItem) {
    
    if (show) {
      toast.error('No task is available to accept this file type!')
      setShow(false)
      setOpen(false)
    }
    
    return null
  }

  let onSelectChange=(e) => {
    document.getElementById('resultInput').value = fileName+'_'+e.target.value
  }
  
  return <>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select New Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div >
          <InputLabel id="select">Task Type</InputLabel>
          <Select onChange={onSelectChange} ref={selectRef} labelId="select" id="select" defaultValue={firstItem}>
            {selectItems}
          </Select><br></br>
          <label htmlFor="resultInput">Result Name:</label>
          <input id="resultInput" defaultValue={fileName+'_'+firstItem} type="text" className="form-control"/>
          <br></br>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={addNewTask}>
            Add Task
        </Button>
        <Button variant="secondary" onClick={handleClose}>
            Close
        </Button>
      </Modal.Footer>
    </Modal>
  </>
}

const mapStateToProps = (state) => {
  if (!state || !state.file_current)
    return{fileType: null}

  return {
    fileType: state.file_current.fileType,
    fileName:state.file_current.name
  }
}

NewTaskDialogue = connect(mapStateToProps)(NewTaskDialogue)
export default NewTaskDialogue