import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import Controls from 'components/model/controls/Controls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import { Canvas } from 'react-three-fiber'

const setSurfaceColor = (geometry) => {
  let colors = []
  for (var i = 0; i < geometry.vertices.length; i++)
    colors.push(new THREE.Color(Math.random() * 0xffffff))

  const vertexIndices = ['a', 'b', 'c'] 

  for(let i = 0; i < geometry.faces.length; i++) {
    let face = geometry.faces[i]
    
    for (let v = 0; v < 3; v++) {
      const vertexId = face[vertexIndices[v]]
      
      face.vertexColors[v] = colors[vertexId]
    }
  }
}

const ObjFile = ({ path, data }) => {
  const [object, setObject] = useState()

  useMemo(
    () => {
      const generateObject = (object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.center()
            child.material.side = THREE.DoubleSide
            const objGeometry = new THREE.Geometry().fromBufferGeometry(child.geometry)
            setSurfaceColor(objGeometry)
            const objMaterial = new THREE.MeshLambertMaterial({
              vertexColors: THREE.VertexColors,
              wireframe: false
            })
            child.geometry = objGeometry
            child.material = objMaterial
          }
        })
        setObject(object)
      }

      if(path) {
        console.log('PARSING WITH FILE URL')
        const loader = new OBJLoader()
        loader.load(path, generateObject)
      } else if(data) {
        console.log('PARSING THROUGH FILE TEXT')
        const object = new OBJLoader().parse(data)
        generateObject(object)
      }
    }, [path, data])
  
  return <Canvas
    orthographic
    style={{
      flexGrow: 1,
    }}>
    <Controls/>
    {object && <primitive object={object}/>}
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    {object && <boxHelper args={[object, 0x000000]}/>}
  </Canvas>
}

ObjFile.propTypes = {
  path: PropTypes.string, // This path must start from the public folder where index.html is that includes the file name (exp. assets/fileName.obj)
  data: PropTypes.string, // Simply pass the file\'s text into the \'data\' prop
}

export default ObjFile