import React, {  useMemo } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useUpdate } from 'react-three-fiber'
import { getPointsColorMap } from '../points/helpers/colorMap/colorMap'

const Line = ({ line, colorMap, dims }) => {
  const colors = useMemo(() => colorMap
    ? getPointsColorMap(line, colorMap)
    : null, [line, colorMap])

  const points = useMemo(
    () => line.points.map((coord) =>
      new THREE.Vector3(...coord)),
    [line])

  const ref = useUpdate((geometry) => {
    geometry.setFromPoints(points)
    geometry.colors = colors
  }, [])

  return <line>
    <geometry
      attach='geometry'
      ref={ref}/>
    <lineBasicMaterial
      attach='material'
      args={[{
        vertexColors: colorMap ? true : false,
      }]}/>
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
    ).isRequired,
    point_data: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  }),
  colorMap: PropTypes.shape({
    type: PropTypes.string.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }),
}

export default Line
