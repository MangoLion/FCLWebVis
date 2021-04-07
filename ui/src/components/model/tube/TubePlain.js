import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useUpdate } from 'react-three-fiber'
import { getPointsColorMap } from '../points/helpers/colorMap/colorMap'

const TubePlain2 = ({ line, dims, spacing }, ref) => {

  const path = useMemo(
    () => new THREE.CatmullRomCurve3(
      line.points.map((coord) =>
        new THREE.Vector3(...coord)
      )
    ),
    [line.points]
  )
  const ratio = 0.0005
  let size = dims[1]*dims[2]*spacing*ratio/2
  const tabularSegments = line.points.length
  const radius = size//0.1
  const radialSegments = 8
  const closed = true

  return <mesh ref={ref}>
    <tubeGeometry
      attach='geometry'
    
      args={[
        path,
        tabularSegments,
        radius,
        radialSegments,
        closed,
      ]}/>
    <meshBasicMaterial
      attach='material'
      args={[{
        color: 0x00ff00
      }]}/>
  </mesh>
}
/*
TubePlain.propTypes = {
  line: PropTypes.shape({
    id: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
    points: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.number.isRequired
      ).isRequired
    ).isRequired,
  })
}*/
const TubePlain = React.forwardRef(({ line, dims, spacing }, ref) => {
  const path = useMemo(
    () => new THREE.CatmullRomCurve3(
      line.points.map((coord) =>
        new THREE.Vector3(...coord)
      )
    ),
    [line.points]
  )
  const ratio = 0.0005
  let size = dims[1]*dims[2]*spacing*ratio/3
  const tabularSegments = line.points.length
  const radius = size//0.1
  const radialSegments = 8
  const closed = true

  return <mesh ref={ref}>
    <tubeGeometry
      attach='geometry'
    
      args={[
        path,
        tabularSegments,
        radius,
        radialSegments,
        closed,
      ]}/>
    <meshBasicMaterial
      attach='material'
      args={[{
        color: 0x00ff00
      }]}/>
  </mesh>
})

export default TubePlain
