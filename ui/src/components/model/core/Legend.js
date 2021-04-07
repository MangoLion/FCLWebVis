import React, { useMemo, useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { getValueColorMap } from '../points/helpers/colorMap/colorMap'
import * as THREE from 'three'
import { Canvas } from 'react-three-fiber'

const Legend = ({colorMap}) => {
  const Sty1={
    height:'200px',
    width: '100px',
    borderStyle: 'dashed',
    borderColor: 'yellow',
    backgroundColor: 'transparent',
    position: 'absolute',
    right: '25px',
    top: '25px'
  }

  useEffect(() => {
    var canvas = document.getElementById('legend')

  }, [colorMap])

  return <Canvas style={Sty1} id="legend"/>
}

export default Legend