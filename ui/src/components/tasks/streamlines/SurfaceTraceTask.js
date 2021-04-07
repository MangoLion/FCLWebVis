import React from 'react'
//import FileForm from './form/FileInput'
import InputComponent from '../../inputs/InputComponent'
import DragPad from '../../inputs/DragPad'
import SliderInput from '../../inputs/SliderInput'
import DropdownComponent from '../../inputs/DropdownComponent'
import ColorSchemeDropdown from '../../inputs/ColorSchemeDropdown'
import { connect } from 'react-redux'
import {registerTaskType} from '../../../utilities/taskTypes'
import {registerFileType} from '../../../utilities/fileTypes'
import set_field from '../../../redux/actions/SetField'
import { Button} from 'react-bootstrap'
import SeedingCurve from 'components/model/core/SeedingCurve'

function addParenthesis(pts) {
  var result = ''
  for (var i=0; i < pts.length; i +=3) {
    result += '(' + pts[i] + ', ' + pts[i+1] +', ' + pts[i+2]+')'
    if (i < pts.length-3)
      result += ', '
  }
  return result
}

function parse_seeding_points(file) {
  var seeding_points = []
  switch (file.taskFields.seeding_type.value) {
  case 'start end':
    
    var pt_start = file.taskFields.seeding_start.value.split(',').map(Number),
      pt_end = file.taskFields.seeding_end.value.split(',').map(Number),
      slope = [pt_end[0]-pt_start[0], pt_end[1]-pt_start[1],pt_end[2]-pt_start[2]],
      num = file.taskFields.seeding_density.value
      
    for (var i = 0; i < num; i ++) {
      seeding_points.push(
        pt_start[0]+slope[0]/num*i,pt_start[1]+slope[1]/num*i, pt_start[2]+slope[2]/num*i
      )
    }
    break
  case 'points':
    seeding_points = file.taskFields.seeding_points.value.split(',').map(Number)
    break
  }
  return addParenthesis(seeding_points)
}

const init = () => {
  registerTaskType({
    name: 'surface_trace',
    init:(parentFile, taskFields) => {
      var ranges = parentFile.fileFields['data_range'].value
      taskFields['stepsize'].value = (ranges[1]-ranges[0])/20
      taskFields['seeding_start'].value = (ranges[1]-ranges[0])/2+','+(ranges[3]-ranges[2])*0.1 + ','+(ranges[5]-ranges[4])/2
      taskFields['seeding_end'].value = (ranges[1]-ranges[0])/2+','+(ranges[3]-ranges[2])*0.9 + ','+(ranges[5]-ranges[4])/2
      taskFields['divergent_threshold_min'].value = Math.pow((ranges[1]-ranges[0])*(ranges[3]-ranges[2])*(ranges[5]-ranges[4]),1/3)/3
      taskFields['divergent_threshold_max'].value = Math.pow((ranges[1]-ranges[0])*(ranges[3]-ranges[2])*(ranges[5]-ranges[4]),1/3)/2
    },
    fields: {
      direction:{
        name:'direction',
        value:'both'
      },
      stepsize:{
        name:'stepsize',
        value:2
      },
      length:{
        name: 'length',
        value: 100
      },
      divergent_threshold_min:{
        name: 'divergent_threshold_min',
        value: 3
      },
      divergent_threshold_max:{
        name: 'divergent_threshold_max',
        value: 5
      },
      seeding_type:{
        name:'seeding_type',
        value:'points'
      },
      seeding_points:{
        name:'seeding_points',
        value:'(0,0,0),(1,1,1)',
        manual_update: true
      },
      seeding_start:{
        name:'seeding_start',
        value:'0, 0, 0'
      },
      seeding_end:{
        name:'seeding_end',
        value:'1, 1, 1'
      },
      seeding_density:{
        name:'seeding_density',
        value:'5'
      },
      show_seeding_curve:{
        name:'show_seeding_curve',
        value:'line'
      }
    },
    inputFileType: 'vectorfield_vtk',
    outputFileType: 'surface_obj',
    /*onSubmit: function(dispatch, file) {
      var seeding_points = parse_seeding_points(file)
      file.taskFields.seeding_points = seeding_points//.join(',')
      alert(seeding_points)
      dispatch(set_field({
        name: 'seeding_points',
        isFileInput: false,
        value:seeding_points.join(',')
      }))*/
  })

  registerFileType({
    name: 'surface_obj',
    fields: {
      color_scheme:{
        name: 'color_scheme',
        value: 'RAINBOW'
      },
      point_data_max:{
        name:'point_data_max',
        value: '0'
      },
      point_data_min:{
        name:'point_data_min',
        value: '0'
      },
      point_data:{
        name:'point_data',
        value: []
      },
      data_range:{
        doDisplay: true,
        value:[0,0,0,0,0,0]
      },origin:{
        value:[0,0,0]
      },
      spacing:{
        value:[0,0,0]
      },
    },
    sendToServer: false
  })
}

init()

let SurfaceTraceView = ({ task }) => {

  return <SeedingCurve task={task} />
}

let SurfaceTraceInputs = ({dispatch,seeding_type, file}) => {
  let onGenerate = () => {
    var seeding_points = parse_seeding_points(file)
    //file.taskFields.seeding_points = seeding_points//.join(',')
    //alert(seeding_points)
    dispatch(set_field({
      name: 'seeding_points',
      isFileInput: false,
      value:seeding_points//.join(',')
    }))
    dispatch(set_field({
      name: 'seeding_type',
      isFileInput: false,
      value:'points'
    }))
  }
  //file.fileFields.seeding_type
  let seedingComponent
  switch(seeding_type) {
  case 'start end':
    seedingComponent=<>
      <InputComponent name="seeding_start"  isFileInput={false}/>
      <InputComponent name="seeding_end"  isFileInput={false}/>
      <InputComponent name="seeding_density"  isFileInput={false}/>
      <Button onClick={onGenerate}>Generate Seeding Pts</Button>
      <br/>
    </>
    break
  case 'points':
    seedingComponent=<><InputComponent name="seeding_points"  isFileInput={false}/></>
    {/*<SliderInput name="seeding point index"/>
      <DragPad name="transform_xy"  isFileInput={false}/>
  <DragPad name="transform_z"  isFileInput={false}/></>*/}
    break
  }

 

  return <div>
    <DropdownComponent name="direction"  values={['both', 'forward', 'backward']} isFileInput={false}/>
    <InputComponent name="stepsize"  isFileInput={false}/>
    <InputComponent name="length"  isFileInput={false}/>
    <InputComponent name="divergent_threshold_min"  isFileInput={false}/>
    <InputComponent name="divergent_threshold_max"  isFileInput={false}/>
    <DropdownComponent name="show_seeding_curve"  values={['hide', 'points', 'tube', 'line']} isFileInput={false}/>
    <DropdownComponent name="seeding_type"  values={['points', 'start end']} isFileInput={false}/>
    
    {seedingComponent}
  </div>
}

let SurfaceObjInputs = () => {
  

  return <div>
    <ColorSchemeDropdown />
  </div>
}
const mapStateToProps = (newState) => {
  if (!newState)
    return{}
  return { seeding_type: newState.file_current.taskFields.seeding_type.value,
  //TODO
    file: newState.file_current }
} 

SurfaceTraceInputs = connect(mapStateToProps)(SurfaceTraceInputs)

export {
  init,
  SurfaceTraceInputs,
  SurfaceObjInputs,
  SurfaceTraceView
}
