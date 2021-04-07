import React from 'react'
import PropTypes from 'prop-types'
import shortid from 'shortid'

import { Canvas } from 'react-three-fiber'

import Line from 'components/model/line/Line'
import Controls from 'components/model/controls/Controls'

const Streamlines = ({ lines }) => {
  const X = lines.map((line) => line.map((coord) => coord[0])).flat(),
    Y = lines.map((line) => line.map((coord) => coord[1])).flat(),
    Z = lines.map((line) => line.map((coord) => coord[2])).flat()

  const avgX = X.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / X.length,
    avgY = Y.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / Y.length,
    avgZ = Z.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / Z.length

  return <Canvas
    style={{
      flexGrow: 1,
    }}>
    <Controls initLookAt={[avgX, avgY, avgZ]}/>
    {lines.map((line) =>
      <Line 
        key={shortid.generate()}
        line={line}/>)}
  </Canvas>
}

Streamlines.propTypes = {
  lines: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.number.isRequired
      ).isRequired,
    ).isRequired,
  ).isRequired,
}

export default Streamlines