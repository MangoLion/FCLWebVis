import * as THREE from 'three'
import React, { useState, useMemo } from 'react'
import LinePlain from './LinePlain'
import shortid from 'shortid'
import TubePlain from './../tube/TubePlain'
import { extend, useThree, useFrame } from 'react-three-fiber'
import { SphereGeometry, MeshBasicMaterial, Raycaster, SphereBufferGeometry } from 'three'
import Points from '../points/Points'
import { toast } from 'react-toastify'

const SeedingCurve = ({task}) => {


  const { camera, gl } = useThree()
  
  var seeding_pts = task.taskFields.seeding_points.value.replaceAll('(','').replaceAll(')','').split(',')
  var points = []
  for (var i = 0; i < seeding_pts.length; i += 3) {
    points.push([parseFloat(seeding_pts[i]), parseFloat(seeding_pts[i+1]), parseFloat(seeding_pts[i+2])])
  }

  //init
  var clientRect = gl.domElement.getBoundingClientRect()
  let SCREEN_WIDTH = clientRect.width, SCREEN_HEIGHT = clientRect.height
  let VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000
  let MAG_ANGLE = 30
  

  let  lineRef = React.createRef(),
    sphereRef = React.useRef(),
    raycaster = new THREE.Raycaster()
  raycaster.params.Line.threshold = 3

  let mouse = new THREE.Vector2()
  let onDocumentMouseMove = (e) => {
    
    mouse.x = e.clientX/SCREEN_WIDTH*2 - 1
    mouse.y = e.clientY/SCREEN_HEIGHT*2 + 1
    raycaster.setFromCamera( mouse, camera )   
    var children = [lineRef.current]
    var sphereInter = sphereRef.current
    var intersects = raycaster.intersectObjects( children, true )
    
    if ( intersects.length > 0 ) {

      sphereInter.visible = true
      console.log('INTERSECT!')
      console.log(intersects)
      sphereInter.position.copy( intersects[ 0 ].point )

    } else {
      if (sphereInter)
        sphereInter.visible = false

    }
  }

  //window.addEventListener( 'resize', onWindowResize, false )    
  //gl.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false )
  useFrame(() => {
    
  })

  
  
  let line = {
    id: 0,
    length: points.length,
    points,
    point_data:points
  }
  //if (!task.fileFields.dims || !task.fileFields.spacing || !task.fileFields.show_seeding_curve)
  // return null
  let dimensions
  if (task.fileFields.dims)
    dimensions= task.fileFields.dims.value
  else
    dimensions=[0,0,0]

  let spacing 
  if (task.fileFields.spacing) {
    spacing= task.fileFields.spacing.value
    spacing = (spacing[0] + spacing[1] + spacing[2])/3
  }
  else{
    spacing=0
    toast.error('no spacing!')
  }
  let type = task.taskFields.show_seeding_curve.value 
  if (type == 'hide' || !task.doRender)
    return null
  let Component = null
  switch (type) {
  case 'points':
    Component = Points
    break
  case 'line':
    Component = LinePlain
    break
  case 'tube':
    Component=TubePlain
    break
  default:
    break
  }
  if (!Component) {
    alert(type)
    return null
  }

  return <>
    <Component
      ref={lineRef}
      key={shortid.generate()}
      line={line}
      dims={dimensions}
      spacing = {spacing}/>

  </>
}

export default SeedingCurve