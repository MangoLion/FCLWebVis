import React, { useMemo, useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { getValueColorMap } from '../points/helpers/colorMap/colorMap'
import * as THREE from 'three'
import set_field from  'redux/actions/SetField' //'/redux/actions/SetField'



const setSurfaceColor = (geometry, colorMap, point_data) => {
  geometry.mergeVertices()
  let colors = []
  let randColor = new THREE.Color(Math.random() * 0xffffff)
  for (var i = 0; i < geometry.vertices.length; i++)
    if (point_data.length > 0)
      colors.push(getValueColorMap(point_data[i], colorMap))//new THREE.Color(Math.random() * 0xffffff))
    else
      colors.push(randColor)

  const vertexIndices = ['a', 'b', 'c']

  for(let i = 0; i < geometry.faces.length; i++) {
    let face = geometry.faces[i]
    
    for (let v = 0; v < 3; v++) {
      const vertexId = face[vertexIndices[v]]
      
      face.vertexColors[v] = colors[vertexId]
    }
  }
}

const ObjFile = ({dispatch, file}) => {

  const [object, setObject] = useState()
  let colorMap = null
  useMemo(
    () => {
      
      
      const generateObject = (object) => {
        var bbox
        colorMap={
          type: file.fileFields.color_scheme.value,
          min: file.fileFields.point_data_min.value,
          max: file.fileFields.point_data_max.value,
        }
        let point_data = file.fileFields.point_data.value

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            //child.geometry.center()
            
            const objGeometry = new THREE.Geometry().fromBufferGeometry(child.geometry)
            setSurfaceColor(objGeometry, colorMap, point_data)
            const objMaterial = new THREE.MeshLambertMaterial({
              vertexColors: THREE.VertexColors,
              wireframe: false
            })
            child.geometry = objGeometry
            child.material = objMaterial
            child.material.side = THREE.DoubleSide
            child.geometry.computeBoundingBox()
            bbox = child.geometry.boundingBox
          }
        })
        setObject(object)
        var sumRange = file.fileFields.data_range.value.reduce(function(a, b) {
          return Math.abs(a + b)
        }, 0)

        if (sumRange == 0)
          if (file.parentFile  
              && file.parentFile.id != 'root'
              && file.parentFile.fileFields.data_range
              && file.parentFile.fileFields.origin) {
            dispatch(set_field({
              fileName: file.id,
              name: 'data_range',
              value: file.parentFile.fileFields.data_range.value,
              isFileInput:true
            }))

            dispatch(set_field({
              fileName: file.id,
              name: 'origin',
              value: file.parentFile.fileFields.origin.value,
              isFileInput:true
            }))
          }else if (bbox) {
            dispatch(set_field({
              fileName: file.id,
              name: 'data_range',
              value: [bbox.min.x, bbox.max.x, bbox.min.y, bbox.max.y,bbox.min.z, bbox.max.z],
              isFileInput:true
            }))
          //console.log(file.fileFields.data_range.value)
          //console.log([bbox.min.x, bbox.max.x, bbox.min.y, bbox.max.y,bbox.min.z, bbox.max.z])
          }
      }

      /*if(path) {
        console.log('PARSING WITH FILE URL')
        const loader = new OBJLoader()
        loader.load(path, generateObject)
      } else*/
      if(file.doRender&&file.fileContent&&!object) {
        //console.log('PARSING THROUGH FILE TEXT')
        const object = new OBJLoader().parse(file.fileContent)
        generateObject(object)
      }
    }, [])
  
  return <Fragment>
    {object && <primitive object={object}/>}
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
  </Fragment>
}

ObjFile.propTypes = {
  path: PropTypes.string, // This path of the file must start from the public folder where index.html is (exp. 'assets/fileName.obj')
  data: PropTypes.string, // Simply pass the file's text into the 'data' prop
}

export default ObjFile