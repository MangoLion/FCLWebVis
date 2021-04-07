import React, { useRef, Fragment, useEffect } from 'react'

import PropTypes from 'prop-types'
import * as THREE from 'three'
import { extend, useThree, useFrame } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
//import Axes from '../core/Axes'


extend({ OrbitControls })

// TODO: Camera helper threejs

const Controls = ({ location, lookAt }) => {
  const controlRef = useRef()
  const { camera, gl } = useThree()

  useEffect(() => {
    if(location)
      controlRef.current.position = new THREE.Vector3(...location)
    if(lookAt)
      controlRef.current.target = new THREE.Vector3(...lookAt)
    controlRef.current.update()
  }, [])

  useFrame(() => {
    controlRef.current.update()
  })

  return <Fragment>
    <orbitControls
      ref={controlRef}
      args={[camera, gl.domElement]}/>
  </Fragment>
}

Controls.propTypes = {
  location: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  lookAt: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
}

export default Controls