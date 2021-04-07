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

const init = () => {
  registerTaskType({   
    name: 'neighbor_find',
    init:(parentFile, taskFields) => {
    },
    fields: {
    },    
    inputFileType: 'streamlines_array',
    outputFileType: 'segment_map',
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
    name: 'segment_map',
    fields: {
    },
    sendToServer: false
  })
}

init()

let FindNeighborView = ({ task }) => {

  return null
}

let FindNeighborInputs = ({ task }) => {

  return null
}

let SegmentMapView = ({ file }) => {

  return null
}
let SegmentMapInputs = ({ file }) => {

  return null
}
export {
  FindNeighborView,
  FindNeighborInputs,
  SegmentMapView,
  SegmentMapInputs
}
