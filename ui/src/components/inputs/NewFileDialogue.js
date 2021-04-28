import React, {useState, useRef} from 'react'
//import set_field from './../../redux/actions/SetField'
//import add_file from './../../redux/actions/AddFile'
import { connect } from 'react-redux'
import {Modal,Button} from 'react-bootstrap'
import {getFileTypes, getFileType} from './../../utilities/fileTypes'
//import {getFileNames} from './../../utilities/taskHandler'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import {getIoInstance} from './../../utilities/ioInstance'
import set_loaded from './../../redux/actions/SetAlreadyLoaded'
import set_progress from './../../redux/actions/SetProgress'
import load_workspace from './../../redux/actions/loadWorkspace'
import {samples, getSampleType} from './../../utilities/sample'
import { toast } from 'react-toastify'
import { getWorkspaces } from 'utilities/userdata'
/**
 * Opens a dialogue that allow the user to choose a new file to add to the top layer of the tree view (TreeWindow)
 * @todo fix the setOpen redundancy
 * @component
 * @prop {function} setOpen a roundabout callback from TreeWindow, if the user manually close this dialogue, let TreeWindow knows. This may seems redundant, but it prevented an endless loop bug when the user close the dialogue.
 * @prop {Boolean} open passed by TreeWindow, true if the user opened this dialogue. (see todo to fix in future)
 * @prop {function} onNewFile callback passed by TreeWindow, called once the user press the Add File button. TreeWindow will send a new_file redux action
 * @prop {string[]} allFilenames passed by TreeWindow, is the list of names of all current files (including files as a result of tasks)
 */
let NewFileDialogue = ({dispatch, addToggle, setOpen, open, onNewFile, allFileNames}) => {
  const [show, setShow] = useState(open)

  //for the moment, the client keeps track of the file names it has uploaded to the server, rather than requesting the server for the list of filenames
  // const [fileNames, setFileNames] = useState([])
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

  /*
  These legacy functions were previously used to display a list of files that already exists on the server. Currently not needed

 
  

  */

  const onListItemClick = (e) => {
    let value = e.target.innerText
    var lastThree = value.substr(value.length - 3)
    if (lastThree == '.ws') {
      getIoInstance().emit('get workspace', {
        name: value
      })
      toast('Loading workspace, please wait')
      dispatch(load_workspace())
      handleClose()
      return
    }
    var type = getSampleType(value)    
    onNewFile({
      name: value,
      content: '',
      type
    })
    dispatch(set_progress({
      sending: 0.1,
      processing: 0,
      receiving: 0
    }))
    getIoInstance().emit('file submit', {
      id: value,
      contents:'',
      type
    })
    handleClose()
  }

  const onListItemClick2 = (e) => {
    let value = e.target.innerText
    toast(value)
    getIoInstance().emit('load user workspace', {
      workspace_name: value
    })
    toast('Loading workspace, please wait')
    //dispatch(load_workspace())
    handleClose()
  }

  function UserDataList() {
    const list = []
    getWorkspaces().forEach(ws=>{
      if (ws!= "null") list.push(<li key={ws} onClick={onListItemClick2}>{ws}</li>)
    })
    return   <ul >{list}</ul>  
  }

  function BasicList() {
    const types = []
    for (var type in samples) {
      let listNames = []
      samples[type].forEach(name => listNames.push(<li key={name} onClick={onListItemClick}>{name}</li> ))
      types.push(<li key={type}>{type}<ul >{listNames}</ul></li> )
    }
    const listTypes = types//values.map((value) =>    <li key={value} onClick={onListItemClick}>{value}</li>  )  
    return   <ul >{listTypes}</ul>  
  }
  /**
   * reference to the drop down component to select file type
   */
  let selectRef = useRef()

  /**
   * 
   * @param {*} e 
   */
  function submitFile(fileName, fileContent, type) {
    let obj_message = {
      id: fileName,
      contents:fileContent,
      type
    }
    dispatch(set_progress({
      sending: 0.1,
      processing: 0,
      receiving: 0
    }))
    getIoInstance().emit('file submit', obj_message)

  }

  /**
   * This function is triggered once the user selects a file. It will directly read the file contents
   * and call the onNewFile callback (passed by TreeWindow to props) with the nessesary arguments to create a new file
   * @param {*} e - event that holds html <input>
   */
  function onFileChange(e) {
    let fileName = e.target.files[0].name
    let fr=new FileReader() 
    fr.onload=function() { 
      let new_name = fileName
      var fileType = selectRef.current.textContent
      if (allFileNames[new_name]) {
        alert('File name already exists, appended _new!')
        new_name+='_new'
      }
      if (getFileType(fileType).sendToServer) {
        if (!getIoInstance().connected) {
          toast.error('This file require server to process, please check server connection.')
          handleClose()
          return
        }
        submitFile(new_name, fr.result, selectRef.current.textContent)
        
      }
      
      onNewFile({
        name: new_name,
        content: fr.result,
        type: fileType
      })
      addToggle(new_name)
      
      
    } 
          
    fr.readAsText(e.target.files[0]) 
  }
  let fileNames = BasicList(),
    workspaceNames = UserDataList()
  /**
   * get the list of all file types from fileTypes.js
   */
  let fileTypes = getFileTypes()

  /**
   * holds the list of MenuItems of each file type
   */
  let selectItems = []

  /**
   * first file type name as the default choice in the drop down component
   */
  let firstItem = null
  for (let name in fileTypes) {
    if (!fileTypes[name].enableUpload)
      continue

    if (!firstItem)
      firstItem = name
    selectItems.push(<MenuItem value={name}>{name}</MenuItem>)
  }
  return <>
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select File</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div >
          <InputLabel id="select">File Type</InputLabel>
          <Select ref={selectRef} labelId="select" id="select" defaultValue={firstItem}>
            {selectItems}
          </Select>
          <br></br>
          <input type="file" name="file"   onChange={onFileChange}/>
        </div>
        <h5>Server Files:</h5>
        {<BasicList values={fileNames}/>}
        <h5>YOUR Files:</h5>
        {<UserDataList values={workspaceNames}/>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            Close
        </Button>
      </Modal.Footer>
    </Modal>
  </>  
}

NewFileDialogue = connect()(NewFileDialogue)
export default NewFileDialogue