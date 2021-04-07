import React from 'react'
// import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
// import { blue } from '@material-ui/core/colors'
import { connect } from 'react-redux'
import loadWorkspace from '../../redux/actions/loadWorkspace'
import set_file from '../../redux/actions/SetFile'
import file_set from '../../redux/actions/SetFile'
import WaitDialog from './WaitDialog'
import InfoIcon from '@material-ui/icons/Info'
import { Link } from 'react-router-dom'
import { getFileType } from 'utilities/fileTypes'
import { getTaskType } from 'utilities/taskTypes'
/*const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
})*/

function SimpleDialog({ setFile, loadWS, onClose, selectedValue, open, state }) {
  // const classes = useStyle()

  const handleClose = () => {
    onClose(selectedValue)
  }

  const [showWait, setShowWait] = React.useState(false)
  const [showWaitLoad, setShowWaitLoad] = React.useState(false)
  
  /*const handleListItemClick = (value) => {
    onClose(value)
  }*/

  const recursiveParentRemove = (file) => {
    if (file.parentFile)
      delete file.parentFile 
    if (file.alreadyLoaded)
      file.alreadyLoaded = false
    for (var name in file.children) {
      recursiveParentRemove(file.children[name])
    }
  }

  const recursiveParentAdd = (file) => {
    for (var name in file.children) {
      var child = file.children[name]
      child.parentFile = file
      recursiveParentAdd(child)
    }
  }
  const saveFileNATIVE = () => {
    if (!state.file_current) {
      alert('No file selected!')
      return
    }

    //shallow copy
    setShowWait(true)
    window.setTimeout(() => {
      var new_state = {}
      var file = state.file_current
      var type = getTaskType(file.taskType)
      if (!type.onSubmit)
        return
      new_state = type.onExport(file)
      if (!new_state)
        return

      var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(new_state)
      var dlAnchorElem = document.getElementById('downloadAnchorElem')
      dlAnchorElem.setAttribute('href',     dataStr     )
      dlAnchorElem.setAttribute('download', 'scene.json')
      dlAnchorElem.click()
      recursiveParentAdd(new_state)
      setShowWait(false)
    },500)
    
  }

  const saveFileJSON = () => {
    if (!state.file_current) {
      alert('No file selected!')
      return
    }

    //shallow copy
    setShowWait(true)
    window.setTimeout(() => {
      var new_state = {...state}
      var file = new_state.file_current
      new_state.file_current = null
      new_state.children = {}
      new_state.children[file.id] = file
      
      recursiveParentRemove(new_state)
      var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(new_state))
      var dlAnchorElem = document.getElementById('downloadAnchorElem')
      dlAnchorElem.setAttribute('href',     dataStr     )
      dlAnchorElem.setAttribute('download', 'scene.json')
      dlAnchorElem.click()
      recursiveParentAdd(new_state)
      setShowWait(false)
    },500)
    
  }

  const saveJSON = () => {
    //shallow copy
    setShowWait(true)
    window.setTimeout(() => {
      var new_state = {...state}
      new_state.file_current = null
      recursiveParentRemove(new_state)
      var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(new_state))
      var dlAnchorElem = document.getElementById('downloadAnchorElem')
      dlAnchorElem.setAttribute('href',     dataStr     )
      dlAnchorElem.setAttribute('download', 'scene.json')
      dlAnchorElem.click()
      recursiveParentAdd(new_state)
      setShowWait(false)
    },500)
    
  }

  const saveJS = () => {
    //shallow copy
    var new_state = {...state}
    new_state.file_current = null
    recursiveParentRemove(new_state)
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent('export default ' +JSON.stringify(new_state))
    var dlAnchorElem = document.getElementById('downloadAnchorElem')
    dlAnchorElem.setAttribute('href',    dataStr     )
    dlAnchorElem.setAttribute('download', 'data.js')
    dlAnchorElem.click()
    recursiveParentAdd(new_state)
  }

  function onFileChangeJSON(e) {
    //let fileName = e.target.files[0].name
    setShowWaitLoad(true)
    let file=e.target.files[0]
    
    window.setTimeout(() => {
      let fr = new FileReader() 
      fr.onload=function() {
        loadWS(JSON.parse(fr.result))
        setShowWaitLoad(false)
        handleClose()
      } 
          
      fr.readAsText(file) 
    },100)
    
  }

  return <>
    <WaitDialog show={showWait} title='Saving, please wait' message='...'/>
    <WaitDialog show={showWaitLoad} title='Loading, please wait' message='...'/>
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Save/Load Options</DialogTitle>
      <List>

        <ListItem autoFocus button onClick={saveJSON}>
          <ListItemText primary="Save workspace" />
        </ListItem>
        <ListItem autoFocus button onClick={saveFileJSON}>
          <ListItemText primary="Save currently selected as workspace" />
        </ListItem>
        <ListItem autoFocus button onClick={saveFileNATIVE}>
          <ListItemText primary="Save currently selected in native format" />
        </ListItem>
        {/*<ListItem autoFocus button onClick={saveJS}>
          <ListItemText primary="Save JS" />
          </ListItem>*/}
        <ListItem autoFocus button >
          <ListItemText primary="Load JSON" />
          <input type="file" name="file"   onChange={onFileChangeJSON}/>
        </ListItem>
      </List>
    </Dialog>
  </>
  
}

let SaveLoadDialogue = ({ state, loadWS, setFile }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState('')

  const handleClickOpen = () => {
    if (state.file_current)
      setFile(state.file_current.name)
    
    
    setOpen(true)
  }

  const handleClose = (value) => {
    setOpen(false)
    setSelectedValue(value)
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Save/Load
      </Button><Button variant="outlined" color="primary" href = "https://github.com/MangoLion/webviswiki/wiki" target = "_blank" 
        rel = "noopener noreferrer">
        <InfoIcon/>
      </Button>
      <SimpleDialog setFile={setFile} loadWS={loadWS} state={state} selectedValue={selectedValue} open={open} onClose={handleClose} />
    </div>
  )
}

const mapStateToProps = (state) => {
  if (!state || !state.file_current)
    return{ state:{}}

  return {
    state
  }
}

const mapDispatchToProps= (dispatch) => (
  {
    setFile:(name) => {
      dispatch(file_set({
        name
      }))
    },
    loadWS: (state) => {
      dispatch(loadWorkspace({
        ...state
      }))
      dispatch(set_file({
        name:state.file_current_name
      }))
    }
  }
)

export default connect(mapStateToProps,mapDispatchToProps)(SaveLoadDialogue) 