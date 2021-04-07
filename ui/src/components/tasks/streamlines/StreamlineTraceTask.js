import React, {useEffect} from 'react'
//import FileForm from './form/FileInput'
import InputComponent from '../../inputs/InputComponent'
import DropdownComponent from '../../inputs/DropdownComponent'
import { connect } from 'react-redux'

import {registerTaskType} from '../../../utilities/taskTypes'
import {registerFileType} from '../../../utilities/fileTypes'
import { Button} from 'react-bootstrap'
import set_field from '../../../redux/actions/SetField'
/*
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
    seeding_points = file.taskFields.seeding_points.value.replaceAll('(','').replaceAll(')','').split(',').map(Number)
    break
  }
  return seeding_points
}*/
function stripPrecision(number) {
  return parseFloat(parseFloat(number).toPrecision(7))
}

function random_range(min, max) {  
  return Math.random() * (max - min) + min 
}  

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
        stripPrecision(pt_start[0]+slope[0]/num*i),stripPrecision(pt_start[1]+slope[1]/num*i), stripPrecision(pt_start[2]+slope[2]/num*i)
      )
    }
    break
  case 'random':
    var rand_num = file.taskFields.random_num.value
    var range = file.parentFile.fileFields.data_range.value
    for (var a = 0; a < rand_num; a ++) {
      seeding_points.push(stripPrecision(random_range(range[0],range[1])),stripPrecision(random_range(range[2],range[3])),stripPrecision(random_range(range[4],range[5])))
    }
    break
  case 'uniform':
    var spacing_x = file.taskFields.uniform_spacing_x.value,
      spacing_y = file.taskFields.uniform_spacing_y.value,
      spacing_z = file.taskFields.uniform_spacing_z.value

    var range = file.parentFile.fileFields.data_range.value
    for (var xx = parseFloat(range[0]); xx < parseFloat(range[1]); xx += parseFloat(spacing_x)) {
      for (var yy = parseFloat(range[2]); yy < parseFloat(range[3]); yy += parseFloat(spacing_y)) {
        for (var zz = parseFloat(range[4]); zz < parseFloat(range[5]); zz += parseFloat(spacing_z)) {
          seeding_points.push(xx,yy,zz)
        }
      }
    }
    break
  case 'points':
    seeding_points = file.taskFields.seeding_points.value.split(',').map(Number)
    break
  }
  return addParenthesis(seeding_points)
}


const init = () => {
  var seeding_pts = ''
  for (var i = 0; i < 100*3; i ++) {
    seeding_pts+= Math.random()
    if (i != 100*3-1)
      seeding_pts +=  ', '
  }

  registerTaskType({
    name: 'streamline_trace_vtk',
    init:(parentFile, taskFields) => {
      var ranges = parentFile.fileFields['data_range'].value
      taskFields['stepsize'].value = stripPrecision(ranges[1]-ranges[0])/100
      taskFields['seeding_start'].value = ranges[0]+','+ranges[2] + ','+ranges[4]
      taskFields['seeding_end'].value = ranges[1]+','+ranges[3] + ','+ranges[5]
      taskFields['uniform_spacing_x'].value = stripPrecision(ranges[1]-ranges[0])/5
      taskFields['uniform_spacing_y'].value = stripPrecision(ranges[3]-ranges[2])/5
      taskFields['uniform_spacing_z'].value = stripPrecision(ranges[5]-ranges[4])/5
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
      random_num:{
        name:'random_num',
        value:'10'
      },
      uniform_spacing_x:{
        name:'uniform_spacing_x',
        value:'2'
      },
      uniform_spacing_y:{
        name:'uniform_spacing_y',
        value:'2'
      },
      uniform_spacing_z:{
        name:'uniform_spacing_z',
        value:'2'
      },
      show_seeding_curve:{
        name:'show_seeding_curve',
        value:'points'
      }
    },
    inputFileType: 'vectorfield_vtk',
    outputFileType: 'streamlines_array',
    onSubmit: function(dispatch, file) {
      /*var seeding_points = parse_seeding_points(file)
      file.taskFields.seeding_points = seeding_points//.join(',')
      alert(seeding_points)
      dispatch(set_field({
        name: 'seeding_points',
        isFileInput: false,
        value:seeding_points.join(',')
      }))*/
    },
    onExport: function(file) {
      var result = ''
      file.fileContent.forEach(sl => {
        for (var i = 0; i < sl.points.length; i ++) {
          var p = sl.points[i]
          result += p[0] +' ' + p[1] + ' ' + p[2]
          if (i != sl.points.length-1)
            result += ' '
        }
        result += '\n'
      })
      
      return result
    }
  })

  registerFileType({
    name: 'streamlines_array',
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
      },
      //from vectorfield
      dims:{
        value:[0,0,0]
      },
      origin:{
        value:[0,0,0]
      },
      spacing:{
        value:[0,0,0]
      },
      data_range:{
        value:[0,0,0,0,0,0]
      }
    },
    sendToServer: false
  })
  registerFileType({
    name: 'vectorfield_vtk',
    enableUpload:true,
    fields: {
      point_data:{
        value:[]
      },
      dims:{
        doDisplay: true,
        passToChildren: true,
        value:[0,0,0]
      },
      origin:{
        doDisplay: true,
        passToChildren: true,
        value:[0,0,0]
      },
      spacing:{
        doDisplay: true,
        passToChildren: true,
        value:[0,0,0]
      },
      data_range:{
        doDisplay: true,
        passToChildren: true,
        value:[0,0,0,0,0,0]
      }
    } 
  })
}

init()

let StreamlinesTraceInputs = ({dispatch, seeding_type,file}) => {
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
    </>
    break
  case 'random':
    seedingComponent=<>
      <InputComponent name="random_num"  isFileInput={false}/>
      <Button onClick={onGenerate}>Generate Seeding Pts</Button>
    </>
    break
  case 'uniform':
    seedingComponent=<>
      <InputComponent name="uniform_spacing_x"  isFileInput={false}/>
      <InputComponent name="uniform_spacing_y"  isFileInput={false}/>
      <InputComponent name="uniform_spacing_z"  isFileInput={false}/>
      <Button onClick={onGenerate}>Generate Seeding Pts</Button>
    </>
    break
  case 'points':
    seedingComponent=<InputComponent name="seeding_points"  isFileInput={false}/>
    break
  }
  
  return <div>
    <DropdownComponent name="direction"  values={['both', 'forward', 'backward']} isFileInput={false}/>
    <InputComponent name="stepsize"  isFileInput={false}/>
    <InputComponent name="length"  isFileInput={false}/>
    <DropdownComponent name="show_seeding_curve"  values={['hide', 'points', 'tube', 'line']} isFileInput={false}/>
    <DropdownComponent name="seeding_type"  values={['points', 'start end', 'random', 'uniform']} isFileInput={false}/>
    {seedingComponent}
  </div>
}
const mapStateToProps = (newState) => {
  if (!newState)
    return{}
  return { seeding_type: newState.file_current.taskFields.seeding_type.value }
} 

StreamlinesTraceInputs=connect(mapStateToProps)(StreamlinesTraceInputs)

export {
  init,
  StreamlinesTraceInputs
}
