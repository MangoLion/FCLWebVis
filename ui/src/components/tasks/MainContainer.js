import React, { Fragment } from 'react'
import Sidebar from '../inputs/Sidebar'
import SidebarLeft from '../inputs/SidebarLeft'
import {MainVisualizer} from './MainVisualizer'
import { connect } from 'react-redux'

import 'bootstrap/dist/css/bootstrap.min.css'
import '../App2.css'
import { getFileType } from 'utilities/fileTypes'
import shortid from 'shortid'



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
      maxHeight:'100vh'
    }}>
      <Sidebar/>
    </div>
    <div style={{
      flexGrow: 1,
      //width:'800px',
      borderStyle: 'ridge', BorderColor: 'Beige'
    }}>
      
      <MainVisualizer enableOrtho={enableOrtho} key={shortid.generate()} style={{}}/>

    </div>
    <div style={{
      flexGrow: 0,
      maxHeight:'100vh'
    }}>
      <SidebarLeft/>
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
