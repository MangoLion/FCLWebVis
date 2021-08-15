import React, { Component } from 'react'
import SubmitComponent from './SubmitComponent'
import TaskInput from 'components/tasks/TaskInput'
import FileInput from 'components/tasks/FileInput'
import TreeWindow from './TreeWindow'
import SaveLoadDialogue from './SaveLoadDialogue'
import { connect } from 'react-redux'
import set_view from '../../redux/actions/SetView'
import Button from '@material-ui/core/Button'


import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'

import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'

let Sidebar = ({dispatch, viewType, openItems}) => {
  //alert(openItems.toString())
  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null) 
      dispatch(set_view(newAlignment))
  }

  return <div className='sidebar'>
    <SaveLoadDialogue />
    
    <ToggleButtonGroup value={viewType} exclusive onChange={handleChange}>
      <ToggleButton value="perspective" aria-label="list">
        Perspective
      </ToggleButton>
      <ToggleButton value="orthographic" aria-label="module">
        Orthographic
      </ToggleButton>
    </ToggleButtonGroup>
    <TreeWindow key={openItems.toString()} openItems={openItems}/>

    {/*<Accordion defaultExpanded={true}>
        <AccordionSummary>Render</AccordionSummary>
          <AccordionDetails style={{display: 'inline',padding: 0}}>*/}
          <FileInput/>
    {/*</AccordionDetails>  
      </Accordion>*/}
    
  </div>
}


//map nested JS object to object.children as list 
const mapStateToProps = (newState) => {
  //alert(newState.openItems)
  return {openItems:newState.openItems,viewType:newState.viewType}
} 
export default connect(mapStateToProps)(Sidebar)