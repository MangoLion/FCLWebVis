import React from 'react'
import { connect } from 'react-redux'
import DropdownComponent from './DropdownComponent'
import {COLOR_MAP_TYPES} from 'components/model/points/helpers/colorMap/colorMap'
let ColorSchemeDropdown = () => {

  return <DropdownComponent name="color_scheme"  values={[COLOR_MAP_TYPES.RAINBOW, COLOR_MAP_TYPES.HEATMAP]} isFileInput={true} />
}

export default ColorSchemeDropdown