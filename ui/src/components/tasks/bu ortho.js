import React,{useRef,useEffect, useState} from 'react'

import { Canvas, useFrame } from 'react-three-fiber'
import {CameraHelper} from 'three'
import OrbitalControls from 'components/model/controls/OrbitalControls'
// import { getMiddleOfModel } from './stream_lines/helpers'
import { connect } from 'react-redux'
import Visualizer from './Visualizer'
import shortid from 'shortid'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { getFileType } from 'utilities/fileTypes'
/**
 * This core component will get the list of files with doRender = true and create a Visualizer component for each of the file.
 * @todo fix hard coded init camera position
 * @component
 * @prop {object[]} files returned from mapStateToProps as a map of all files with doRender = true
 * @prop {number} render_count returned from mapStateToProps, incremented each time the user press Render button
 */
const MainVisualizer = ({dispatch, files, render_count, task, center, data_range}) => {
  const initCameraPosition = [0, 0, 128]//[ 80.0681, 13.953778, 32.9375 ] //getMiddleOfModel(newLines)

  let visualizers = files.map((file) =>
    <Visualizer
      dispatch = {dispatch}
      key={shortid.generate()}
      file={file}
      render_count={render_count}/>
  )
  const [ortho, setOrtho] = useState(false)

  let canvas1 = null,//useRef(),
    canvas2 = null//useRef()
  /*useEffect(() => {
    //console.log(canvas1)
    
    //canvas2.current.scene = canvas1.current.scene
  })*/
  let enableOrtho = false
  console.log('EO')
  console.log(enableOrtho)

  let task_visualizer =  false
  if (task) {
    task_visualizer = <Visualizer
      dispatch = {dispatch}
      key={shortid.generate()}
      task = {task}
      render_count={render_count}/>
  }
  //alert('test3')
  if (task_visualizer)
    visualizers.push(task_visualizer)
  let CanvasElement = null

  if (enableOrtho) {
    CanvasElement = <Canvas
      resize={{ scroll: false }}
      //ref={canvas1}
      onCreated={(e) => {canvas1 = e}}
      camera={{
        position: initCameraPosition,
        center:center,
        target:center
      }}
      orthographic
      concurrent
      gl2
      style={{
        flexGrow: 0.5,
        //width:'49%',
        //float:'left'
      }}>
      <OrbitalControls center={center} data_range={data_range}/>
      {visualizers}
  
    
    </Canvas>
  }else{
  
    CanvasElement = <Canvas
      resize={{ scroll: false }}
      //ref={canvas1}
      onCreated={(e) => {canvas1 = e}}
      camera={{
        position: initCameraPosition,
        center:center,
        target:center
      }}
      style={{
        flexGrow: 0.5
        //width:'49%',
        //float:'left'
        
      }}>
      <OrbitalControls center={center} data_range={data_range}/>
      {visualizers}
    
      
    </Canvas>
  }
  
  //onsole.log(CanvasElement)
  return <>
    <div ></div>
    {CanvasElement}
    {/*
      <Canvas
        id="canvas2"
        resize={{ scroll: false }}
        //ref = {canvas2 => {console.log(canvas2)}}
        onCreated={(e) => {e.scene = canvas1.scene}}
        camera={{
          position: initCameraPosition,
          center:center,
          target:center,
          far:1000
        }}
        concurrent
        gl2
        style={{
          width:'49%',
          float:'right'
        
        }}>
        <OrbitalControls custom={false} center={center}/>
      </Canvas>*/}
  </>
}

const recursiveRenderSearch = (parent, fileList) => {
  let enableOrtho = false
  if (parent.doRender && getFileType(parent.fileType).enableOrtho)
    enableOrtho = true
  for(let fileName in parent.children) {
    let file = parent.children[fileName]
    if (file.doRender) {
      fileList.push(file)
      if (getFileType(file.fileType).enableOrtho)
        enableOrtho = true
    }
    if (file.children) {
      if (recursiveRenderSearch(file, fileList))
        enableOrtho = true
    }
  }
  return enableOrtho
}
let last_render_count = -1
let last_files = null
let last_task = null
let last_enable_ortho = false
const mapStateToProps = (newState) => {
  console.log('RE render!')
  let files = [], task = null//, enableOrtho = newState.viewType=='orthographic'
  //console.log(enableOrtho)
  if (!newState)
    return{files,render_count:0, task:null,center:newState.center}
    
  let data_range = false
  if (newState.file_current) {
    if (newState.file_current.fileFields.data_range)
      data_range = newState.file_current.fileFields.data_range.value
    else if (newState.file_current.parentFile && newState.file_current.parentFile.fileFields.data_range)
      data_range = newState.file_current.parentFile.fileFields.data_range.value
  }
    

  if (newState.render_count === last_render_count) {
    //console.log("no change!")
    return {files:last_files,
      render_count:last_render_count, task:last_task,center:newState.center,data_range:data_range}
  }
  // let t0 = performance.now()
  //enableOrtho = recursiveRenderSearch(newState, files)
  
  if (newState.file_current /*&& newState.file_current.doRender*/ && newState.file_current.taskType) {
    task = newState.file_current
  }else{
    //console.log('failed')
    //console.log(newState.file_current)
  }
  //console.log('FC')
  //console.log(newState.file_current)
  last_render_count = newState.render_count
  last_files = files
  last_task = task
  //last_enable_ortho = enableOrtho
 
  //enableOrtho = newState.viewType=='orthographic'
  // let t1 = performance.now()
  //console.log("recursiveRenderSearch + file set took " + (t1 - t0) + " milliseconds.")
  return{files,
    render_count:newState.render_count, task,center:newState.center,data_range:data_range}
} 

export default connect(mapStateToProps)(MainVisualizer)
