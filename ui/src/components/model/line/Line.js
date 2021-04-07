import React from 'react'
import PropTypes from 'prop-types'
import { useUpdate } from 'react-three-fiber'
import shortid from 'shortid'
import * as THREE from 'three'

const Line = ({ line }) => {
  const verticies = line.map((coord) => new THREE.Vector3(...coord))

  const ref = useUpdate((geometry) => {
    geometry.setFromPoints(verticies)
  }, [])

  return <line
    key={shortid.generate()}>
    <bufferGeometry
      attach='geometry'
      ref={ref}/>
    <lineBasicMaterial
      attach='material'
      color={Math.random()*0xFFFFFF<<0}/>
  </line>
}

Line.propTypes = {
  line: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired
  ).isRequired,
}

export default Line
