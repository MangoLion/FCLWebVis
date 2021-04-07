import * as THREE from 'three'
import { extend, useThree, useFrame } from 'react-three-fiber'
import React, { useState, useEffect } from 'react'
let cam = false
const Axes = ({camera}) => {
  const axes = React.useRef()

  useFrame(() => {
    /*if (!cam) {
      console.log('CAMERA')
      console.log(camera)
      cam = camera
    }*/

    var vector = new THREE.Vector3()
    // Bottom left corner
    vector.set( -0.85, -0.85, -0.5).unproject( camera )
    axes.current.position.set(vector.x, vector.y, vector.z)
  })


  return <mesh>
    <axesHelper
      ref = {axes}
      attach='geometry'
      args={[
        0.02
      ]}/>
  </mesh>
}

export default Axes