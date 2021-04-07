import React,{ useState, useEffect }  from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TreeView from '@material-ui/lab/TreeView'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import TreeItem from '@material-ui/lab/TreeItem'
import { Container} from 'react-bootstrap'
import Button from '@material-ui/core/Button'
import { connect } from 'react-redux'
import set_file from 'redux/actions/SetFile'
import NewFileDialogue from './NewFileDialogue'
import NewTaskDialogue from './NewTaskDialogue'
import add_file from 'redux/actions/AddFile'
import add_task from 'redux/actions/AddTask'
import check_render from 'redux/actions/CheckRender'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import { getIoInstance } from 'utilities/ioInstance'

  
/**
 * A core component that holds MaterialUI's TreeView, New File, and New Task button
 * @component
 * @prop {function} onTreeItemClick callback passed from mapDispatchToProps, dispatch set_file redux action which will set the current file to the selected treeItem
 * @prop {object} data this object is passed from mapStateToProps to be used by the TreeView. It is a nested object that only holds the file name and doRender attribute (for the checkbox) and the file's children files.
 * @prop {function} onNewFile a callback from mapDispatchToProps that dispatch add_file redux action. This callback is passed into the NewFileDialogue
 * @prop {function} onNewTask a callback from mapDispatchToProps that dispatch add_task redux action. This callback is passed into the NewFTaskDialogue
 * @prop {function} onCheckChange a callback from mapDispatchToProps that dispatch check_render redux action. It is triggered everytime the user click on a checkbox in a TreeItem. It will update the current selected file's doRender attribute in the redux state.
 * @prop {string[]} allFileNames the list of names of all the file names (including file result from tasks) to be passed into NewFileDialogue and NewTaskDialogues so they can check for unique file names
 */
let TreeWindow = ({dispatch, openItems, onTreeItemClick, data, onNewFile, onNewTask, onCheckChange, allFileNames, file_current,snapshotMode}) => {
  /**
     *Stylesfrom treeview materialui example
    */
  const useStyles = makeStyles({
    root: {
      height: 260,
      flexGrow: 1,
      maxWidth: 400,
    },
  })
  const classes = useStyles()

  /**
     * mange the open flag of the NewFileDialogue (see its todo to fix)
     */
  const [open, setOpen] = useState(false)
  /**
     * mange the open flag of the NewTaskDialogue (see its todo to fix)
     */
  const [openNewTask, setOpenNewTask] = useState(false)

  const [expanded, setExpanded] = React.useState(['root'])


  useEffect(() => {
    setExpanded(openItems)
  },[openItems])

  /**
     * returns a checkbox component (linked to the file's doRender) with the file name as label
     * @param {*} nodes a simple file object that hold its name, doRender, and its children files (see props.data)
     */
  const renderCheckbox = (nodes) => {
    //console.log(nodes.name + ', ' + nodes.doRender)
    //console.log(nodes)
    if (nodes.name !== 'Directory') return <FormGroup row><FormControlLabel name={nodes.name} 
      control={<Checkbox checked={nodes.doRender} inputProps={{ 'aria-label': 'primary checkbox' }}  onChange={() => onCheckChange(nodes.name)}></Checkbox>}
      
      labelPlacement="end"
    /><div style={{display:'flex',alignItems: 'center'}}>{nodes.name.replace(nodes.parentName+'_','')}</div></FormGroup>
    else return <div>{nodes.name}</div>
  }

  /**
     * recursively returns a treeItem for each file in the tree
     * @param {*} nodes a simple file object that hold its name, doRender, and its children files (see props.data)
     */
  const renderTree = (nodes) => 
    <TreeItem onClick={(e) => onTreeItemClick(nodes.name)} key={nodes.id} name={nodes.name} nodeId={nodes.id} label={renderCheckbox(nodes)}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }
    
  const addToggle = (newId) => {
    //console.log('expanding ' + expanded)
    
    for (var i = 0; i < expanded.length; i ++) {
      if (expanded[i] == newId)
        return
    }
    expanded.push(newId)
    
    setExpanded(expanded)
  }
  /**
     * opens the newFileDialogue by changing its open prop to true
     */
  const openNewFileDialogue = () => {
    if (open) {
      return <NewFileDialogue addToggle={addToggle} setOpen={setOpen} open={open} onNewFile= {onNewFile} allFileNames={allFileNames}></NewFileDialogue>
    }
  }
  /**
     * opens the newTaskDialogue by changing its open prop to true
     */
  const openNewTaskDialogue = () => {
    if (openNewTask) {
      return <NewTaskDialogue addToggle={addToggle} setOpen={setOpenNewTask} open={openNewTask} onNewTask= {onNewTask} allFileNames={allFileNames}></NewTaskDialogue>
    }
  }

  
  let newTaskBt = null, newFilelBt = null
  if (!snapshotMode/* && getIoInstance().connected*/) {
    newFilelBt =  <Button variant="contained" onClick={() => setOpen(true)} color="primary">New Dataset</Button>
    if (file_current)
      newTaskBt=<Button variant="contained" onClick={() => setOpenNewTask(true)}>New Task</Button>
  }

  //console.log(expanded)
  
  let selected = ''
  if (file_current)
    selected = file_current.name
  return (
    <Container>
      {openNewFileDialogue()}
      {openNewTaskDialogue()}
      {newFilelBt}
      {newTaskBt}
      <TreeView
        style={{paddingTop:'25px'}}
        selected={selected}
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={expanded}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        onNodeToggle={handleToggle}
      >
        {renderTree(data)}
      </TreeView>
      
    </Container>
  )
}

/**
 * This recursive function is used by the TreeWindow's mapStateToProps to create a simplier nested object that holds the file name, it's doRender attribute, and recurse to each of the file's children. The function also populate the list of allFileNames
 * @param {*} parent the current file
 * @param {*} reference the nested data object that holds only the file name, its doRender, and its children
 * @param {*} fileNames the list of all file names to be populated
 */
const recursiveDir = (parent, reference, fileNames) => {
  for (let name in reference.children) {
    let newParent = {
      id: name,
      name: name,
      parentName: parent.name,
      doRender: reference.children[name].doRender,
      expanded: true,
      children:[]
    }
    parent.children.push(newParent)
    fileNames[name]=true
    recursiveDir(newParent, reference.children[name], fileNames)
  }
}

//map nested JS object to object.children as list 
const mapStateToProps = (newState) => {
  let root = {
    id: 'root',
    name: 'Directory',
    doRender: false,
    children: [],
  }
  let allFileNames = []
  if (newState)
    recursiveDir(root, newState, allFileNames)
  else{
    return{data: root,allFileNames:{}}
  }
    
  return { data: root, file_current: newState.file_current, allFileNames:allFileNames,snapshotMode:newState.snapshotMode }
} 

//
const mapDispatchToProps= (dispatch) => (
  {
    onTreeItemClick: (fileName) => {
      //console.log(e.target.textContent);
          
      //console.log("dispatching: " + ownProps.name+", "+e.target.value);
      dispatch(set_file({
        name: fileName
      }))},
    onNewFile: (file) => {
      dispatch(add_file({
        name: file.name,
        fileType: file.type,
        fileContent: file.content,
        doRender: true
      }))
    },
    onNewTask: (file) => {
      dispatch(add_task({
        name: file.name,
        taskType: file.type,
        doRender: true
      }))
    },
    onCheckChange: (fileName) => {
      dispatch(check_render(fileName))
    }
        
  }
)


  
export default connect(mapStateToProps, mapDispatchToProps)(TreeWindow) 