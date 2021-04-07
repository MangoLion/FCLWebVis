import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import {CameraHelper} from 'three'

import Controls from 'components/model/controls/OrbitalControls'
import { Canvas } from 'react-three-fiber'
// import { getPointsColorMap } from 'components/model/points/helpers/colorMap/colorMap'

// import * as THREE from 'three'
// import { Box3 } from 'three'

const VolumeRendering = ({ vtk, children }) => {
  const cameraInitProps = useMemo(() => ({
    position: [0, 0, 128],
    target: [
      vtk.origin[0] + vtk.dims[0]/2,
      vtk.origin[1] + vtk.dims[1]/2,
      vtk.origin[2] + vtk.dims[2]/2,
    ],
    center:[
      vtk.origin[0] + vtk.dims[0]/2,
      vtk.origin[1] + vtk.dims[1]/2,
      vtk.origin[2] + vtk.dims[2]/2,
    ]
  }), [vtk.origin, vtk.dims])

  return <><Canvas
    orthographic
    concurrent
    gl2
    style={{
      flexGrow: 1,
    }}>
    <Controls {...cameraInitProps}/>
    {/* <ambientLight
      color={0xFFFFFF}
      intensity={1}/> */}
    {/* <box3Helper args={[
      new THREE.Box3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...vtk.dims)
      ),
      0xffff00
    ]} /> */}
    {children}
    <axesHelper args={1000}/>
  </Canvas>
  
  </>
}

VolumeRendering.propTypes = {
  path: PropTypes.string, // This path must start from the public folder where index.html is that includes the file name (exp. assets/fileName.obj)
  data: PropTypes.string, // Simply pass the file\'s text into the \'data\' prop
}

export default VolumeRendering