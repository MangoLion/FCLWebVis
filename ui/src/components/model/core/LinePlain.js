import React, {  useMemo } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useUpdate } from 'react-three-fiber'
import { getPointsColorMap } from '../points/helpers/colorMap/colorMap'

const Line = ({line}) => {
  const points = useMemo(
    () => line.points.map((coord) =>
      new THREE.Vector3(...coord)),
    [line])

  const ref = useUpdate((geometry) => {
    geometry.setFromPoints(points)
  }, [])

  return <line>
    <geometry
      attach='geometry'
      
      ref={ref}/>
    <lineBasicMaterial
      color={Math.random() * 0xffffff}
      attach='material'/>
  </line>
}

Line.propTypes = {
  line: PropTypes.shape({
    id: PropTypes.number.isRequired,
    length: PropTypes.number.isRequired,
    points: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.number.isRequired
      ).isRequired
    ).isRequired//,
    //point_data: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  })
}

export default Line
