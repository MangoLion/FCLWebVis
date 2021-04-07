import React, { useState, useMemo } from 'react'
import * as THREE from 'three'

import { getLineCoordsFromText } from './helpers'
import InputComponent from '../../inputs/InputComponent'
import DropdownComponent from '../../inputs/DropdownComponent'
import SlideComponent from '../../inputs/SlideComponent'
import shortid from 'shortid'

import {registerTaskType} from '../../../utilities/taskTypes'
import {registerFileType} from '../../../utilities/fileTypes'
import Points from 'components/model/points/Points'
import SeedingCurve from 'components/model/core/SeedingCurve'
import {COLOR_MAP_TYPES} from 'components/model/points/helpers/colorMap/colorMap'
import Line from 'components/model/core/Line'
import ColorSchemeDropdown from '../../inputs/ColorSchemeDropdown'
import ShapeDropdown from '../../inputs/ShapeDropdown'
import Tube from 'components/model/tube/Tube'

const init = () => {
  registerTaskType({
    name: 'volume_render_vtk',
    fields: {
      
    },
    sendToServer: false,
    inputFileType: 'vectorfield_vtk',
    outputFileType: 'volume_render'
  })

  registerFileType({
    name: 'volume_render',
    enableOrtho: true,
    fields: {
      clim_min:{
        name:'clim_min',
        value:0
      },
      clim_max:{
        name:'clim_max',
        value:1
      },
      renderstyle: {
        name:'renderstyle',
        value: 'MIP'
      },
      renderthreshold: {
        name:'renderthreshold',
        value:0.15
      },
      cmdata: {
        name:'cmdata',
        value:'viridis'
      },
    },
    sendToServer: false
  })
}

init()

let VolumeRenderInputs = () => {

  return <div>
    <SlideComponent name='clim_min' value='0' step='0.1' min='0' max='1' isFileInput={true}/>
    <SlideComponent name='clim_max' value='1' step='0.1' min='0' max='1' isFileInput={true}/>
    <SlideComponent name='renderthreshold' value={0.15} step={0.1} min='0' max='1' isFileInput={true}/>
    <DropdownComponent name='renderstyle' values={['MIP', 'ISO']} isFileInput={true}/>
    <DropdownComponent name='cmdata' values={['viridis', 'gray']} isFileInput={true}/>
  </div>
}

export {
  init,
  VolumeRenderInputs
}
