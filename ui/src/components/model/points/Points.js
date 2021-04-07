import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useUpdate } from 'react-three-fiber'
import { getPointsColorMap } from './helpers/colorMap/colorMap'
import whiteCircle from 'components/model/textures/circle/whiteCircle'
import {isOrtho} from 'components/tasks/MainVisualizer'
import { toast } from 'react-toastify'

const Points = ({ line, colorMap, dims, spacing}) => {
  
  //toast('created')
  let colors = useMemo(() => colorMap
    ? getPointsColorMap(line, colorMap)
    : null, [line, colorMap])

  const points = useMemo(
    () => line.points
      .map((coord) =>
        new THREE.Vector3(...coord)),
    [line]
  )

  const ref = useUpdate((geometry) => {
    geometry.setFromPoints(points)
    if (!colors) {
      colors = []
      let randColor = new THREE.Color(Math.random() * 0xffffff)
      line.points.forEach(p => colors.push(randColor))
    }
    /*console.log(points)
    console.log(line)
    console.log(spacing)
    console.log(colorMap)*/
    geometry.colors = colors
    
  }, [])
  const ratio = 0.001
  let size = dims[1]*dims[2]*spacing*ratio
  //if (isOrtho)
  size *= 25
  
  return <points>
    <geometry
      attach='geometry'
      ref={ref}/>
    <pointsMaterial
      attach='material'
      alphaTest={0.5}
      args={[
        {
          size: size,//0.2,
          sizeAttenuation: false,
          map: whiteCircle,
          vertexColors: true,//colorMap !== null,
          transparent: true,
        }
      ]}/>
  </points>
}

Points.propTypes = {
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

export default Points
