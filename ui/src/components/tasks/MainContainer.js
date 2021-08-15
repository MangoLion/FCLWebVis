import React, { Fragment } from 'react'
import Sidebar from '../inputs/Sidebar'
import SidebarLeft from '../inputs/SidebarLeft'
import {MainVisualizer, RenderContainer} from './MainVisualizer'
import { connect } from 'react-redux'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../App2.css'
import { getFileType } from 'utilities/fileTypes'
import shortid from 'shortid'

import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary';
/**
 * Main task layout that holds EVERYTHING
 * @todo use boostrap row instead of Container
 * @component
 */
const MainContainer = ({enableOrtho}) => {
  /*if (true)
    return<VolumeRenderView/>*/

    
  return <Fragment>
    <div style={{
      flexGrow: 0,
      width:'350px',
      maxHeight:'100vh',
      overflowY: 'scroll',
      overflowX: 'visible'
    }}>
      <Sidebar/>
      {/*<Accordion defaultExpanded={true}>
        <AccordionSummary>Parameters</AccordionSummary>
        <AccordionDetails>*/}
          <SidebarLeft/>
        {/*</AccordionDetails>  
      </Accordion>*/}
    </div>
    <div style={{
      flexGrow: 1,
      //width:'800px',
      borderStyle: 'ridge', BorderColor: 'Beige'
    }}>
      
      <MainVisualizer enableOrtho={enableOrtho} key={shortid.generate()} style={{}}/>
      <div id="vis"></div>
    </div>
    <div style={{
      flexGrow: 0,
      maxHeight:'100vh'
    }}>
      
      {/*<SidebarLeft/>*/}
    </div>
  </Fragment>
}


const mapStateToProps = (newState) => {
  //console.log('KEY: ')
  //console.log(newState.viewType=='orthographic')
  //let enableOrtho = recursiveOrthoSearch(newState)
  return {enableOrtho:newState.viewType=='orthographic'}
  
} 
export default connect(mapStateToProps)(MainContainer) // connect()(Tasks)
//export default MainContainer
