import React, { useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'

import { getLineCoordsFromText } from './helpers'
import InputComponent from '../../inputs/InputComponent'
import shortid from 'shortid'

import {registerTaskType} from '../../../utilities/taskTypes'
import {registerFileType} from '../../../utilities/fileTypes'
import Points from 'components/model/points/Points'
import SeedingCurve from 'components/model/core/SeedingCurve'
import {COLOR_MAP_TYPES} from 'components/model/points/helpers/colorMap/colorMap'
import Line from 'components/model/core/Line'
import BoundingBox from 'components/model/core/BoundingBox'
import ColorSchemeDropdown from '../../inputs/ColorSchemeDropdown'
import ShapeDropdown from '../../inputs/ShapeDropdown'
import Tube from 'components/model/tube/Tube'



const init = () => {
  /*registerTaskType({
    name: 'streamline_trace_txt',
    fields: {},
    inputFileType: 'vectorfield_txt',
    outputFileType: 'streamlines_txt'
  })

  registerFileType({
    name: 'vectorfield_txt',
    fields: {}
  })*/

  /*add_field(fields, {
    name: "streamline_num",
    value: 5
  });*/
/*
  registerFileType({
    name: 'streamlines_txt',
    fields: {
      streamline_num:{
        name: 'streamline_num',
        value: 5
      },
      color_scheme:{
        name: 'color_scheme',
        value: 'HEATMAP'
      },
      point_data_max:{
        name:'point_data_max',
        value: '0'
      },
      point_data_min:{
        name:'point_data_min',
        value: '0'
      },
      shape: {
        name: 'shape',
        value: 'LINE'
      }
    },
    sendToServer: false
  })*/
}
   
init()

let StreamLinesViewTXT = ({file}) => {
  
  const initState = {
    validating: true,
    coordsForLines: null,
    content: null,
    streamline_num:5
  }

  const [state, setState] = useState(initState)

  /*useEffect(() => {
    const {
      validating,
      content,
    } = state
    //console.log("state changed")
    //console.log(file)
    //console.log(render_count)
    
    
  }, [render_count])*/


  
  
  

  if(file.doRender && file.fileContent &&!state.coordsForLines)
    getLineCoordsFromText(file.fileContent)
      .then((coordsForLines) => {
        //console.log("txt file view parsing data:"+ file.name)
        //console.log("render count: "+render_count)
        setState({
          validating: false,
          coordsForLines,
          content:file.fileContent,
          streamline_num:file.fileFields.streamline_num.value
        })
          
      })

  if (file.doRender&&state.coordsForLines) {
    //console.log("txt file view is re-rendered:" + file.name)
    //console.log("render count: "+render_count)
    let  newLines = JSON.parse(JSON.stringify(state.coordsForLines))
    if (state.streamline_num && newLines.length >= state.streamline_num)
      newLines = newLines.splice(0, state.streamline_num) 
    let linesComponent = newLines.map((lineCoords) =>
      <Points
        key={shortid.generate()}
        lineCoords={lineCoords}/>)
    /**
       * @todo FIX THIS T.T
       */
    state.coordsForLines=null
    return linesComponent
  }

  return null
}

let VTKView = ({file}) => {
  let BBox = null
  //console.log('View created')
  /*
  var sumRange = file.fileFields.data_range.value.reduce(function(a, b) {
    return Math.abs(a + b)
  }, 0)
  //console.log(sumRange)
  if(file.doRender && sumRange > 0) {
    //alert('yes')
    const origin = file.fileFields.origin.value,
      data_range = file.fileFields.data_range.value
    BBox = <BoundingBox origin={origin} data_range={data_range}/>
  }
  */

  return <group>{BBox}</group>
}

let StreamlineNumInputCheck = (text) => {
  return Number.isInteger(text)
}

let StreamLinesViewArray = ({ dispatch,file }) => {
  
  const initState = {
    validating: true,
    streamlines: null,
    streamline_num:5
  }

  const [state, setState] = useState(initState)
  
  let BBox = null

  if(file.doRender && file.fileContent && !state.streamlines) {
    let streamlines = []

    file.fileContent.forEach(lineObj => {
      
      streamlines.push(lineObj)
    })
    setState({
      validating: false,
      streamlines: streamlines,
      streamline_num:file.fileFields.streamline_num.value
    })
  }

  if(file.doRender && state.streamlines) {
    const origin = file.fileFields.origin.value,
      data_range = file.fileFields.data_range.value
    if (file.parentFile && !file.parentFile.doRender)
      BBox = <BoundingBox origin={origin} data_range={data_range}/>
    else
      BBox = null

    //deep copy to prevent any modification of the streamline data
    let  streamlines = [...state.streamlines]
    if(state.streamline_num && streamlines.length >= state.streamline_num)
      streamlines = streamlines.splice(0, state.streamline_num)
    console.log(file.fileFields.color_scheme.value)
    let Shape
    switch (file.fileFields.shape.value) {
    case 'LINE':
      Shape = Line
      break
    case 'POINT':
      Shape = Points
      break
    case 'TUBE':
      Shape = Tube
    }
    let dimensions = file.fileFields.dims.value
    let spacing = file.fileFields.spacing.value
    spacing = (spacing[0] + spacing[1] + spacing[2])/3

    let lineComponents = streamlines.map((streamline) => {
      if (streamline.length > 0) return<Shape
        key={shortid.generate()}
        line={streamline}
        dims={dimensions}
        spacing = {spacing}
        colorMap={{
          type: file.fileFields.color_scheme.value,
          min: file.fileFields.point_data_min.value,
          max: file.fileFields.point_data_max.value,
        }}/>
      else return null})

    return <group>
      {lineComponents}
      {BBox}
    </group>
  }

  return null
}

let StreamLinesTraceView = ({ task }) => {

  return <SeedingCurve task={task} />
}


let StreamlinesInputs = () => {

  return <div>
    <InputComponent name="streamline_num" value="5"  isFileInput={true} /*inputCheck={StreamlineNumInputCheck}*//>
    <ColorSchemeDropdown />
    <ShapeDropdown />
  </div>
}


export {
  init,
  StreamLinesViewTXT,
  StreamLinesViewArray,
  StreamlinesInputs,
  StreamLinesTraceView,
  VTKView
}
