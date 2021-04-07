import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import { useUpdate } from 'react-three-fiber'
import { getPointsColorMap } from '../points/helpers/colorMap/colorMap'

const Tube = ({ line, colorMap, dims, spacing }) => {

  const colors = useMemo(() => colorMap
    ? getPointsColorMap(line, colorMap)
    : null, [line, colorMap])

  const path = useMemo(
    () => new THREE.CatmullRomCurve3(
      line.points.map((coord) =>
        new THREE.Vector3(...coord)
      )
    ),
    [line.points]
  )
  
  const ratio = 0.001
  let size = dims[1]*dims[2]*spacing*ratio
  const tabularSegments = line.points.length
  const radius = size//0.1
  const radialSegments = 8
  const closed = false

  /* Map streamline colors to a tube*/
  function setTubeColor(geometry, colors, radiusSegments) {
    var vertexIndices = ['a', 'b', 'c']
    var face
    var colorId
    
    var lastValidColor
    for (var i = 0; i < geometry.faces.length; i++) {
      face = geometry.faces[i]
      
      for (var v = 0; v < 3; v++) {
        var vertexId = face[vertexIndices[v]]
        colorId = Math.floor(vertexId/radiusSegments)
        if (colors[colorId])
          lastValidColor = colors[colorId]
        else{
          colors[colorId]= lastValidColor
        }
        face.vertexColors[v] = colors[colorId]
      }
    }
  }

  const ref = useUpdate((geometry) => {
    //geometry.setFromPoints(points)
    setTubeColor(geometry, colors, radialSegments)

  }, [])
  
  return <mesh>
    <tubeGeometry
      attach='geometry'
      colors={colors}
      colorsNeedUpdate
      ref={ref}
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
        vertexColors: colorMap ? true : false,
      }]}/>
  </mesh>
}

Tube.propTypes = {
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


export default Tube
