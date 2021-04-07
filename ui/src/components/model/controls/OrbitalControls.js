import React,{useState} from 'react'
import * as THREE from 'three'
import { extend, useThree, useFrame} from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Vector3 } from 'three'
import { toast } from 'react-toastify'

let updateControls = (camera, data_range, center) => {
  var dist = camera.position.distanceTo(new THREE.Vector3(center[0], center[1], center[2]))
  var maxDist = Math.max(
    Math.abs(data_range[1]-data_range[0]),
    Math.abs(data_range[3]-data_range[2]), 
    Math.abs(data_range[5]-data_range[4])
  )
  maxDist/=2
  //console.log(dist+', ' + maxDist+', '+-1*(dist-maxDist))
  if (dist > maxDist*1) {
    camera.translateZ(-1*(dist-maxDist*1.5))
          
  }

  maxDist *= 5
  //let camArea = Math.abs(camera.right - camera.left) * Mathab.s(camera.bottom-camera.top)
  let camArea = Math.abs(camera.right) * Math.abs(camera.bottom)
  let ratio = maxDist*maxDist/camArea
        
  if (maxDist*maxDist < camArea) {
    let ratio = maxDist*maxDist/camArea
    console.log('resizing')
    camera.left *= ratio
    camera.right *= ratio
    camera.top *= ratio
    camera.bottom *= ratio
    camera.updateProjectionMatrix()
    camArea = Math.abs(camera.right - camera.left) * Math.abs(camera.bottom-camera.top)
  }
}

let lastCenter = [-1,-1,-1]
let cam = false
let lastWheel = 0
let lastDataRange = [-1,-1,-1,-1,-1,-1]
let camPos = false//new Vector3(0,0,0)
let zoom = 1
let lastOrtho = -1
let lastCamera = false
let lastTarget = false

var mousewheelevt=/Firefox/i.test(navigator.userAgent)? 'DOMMouseScroll' : 'mousewheel' //FF doesn't recognize mousewheel as of FF3.x
let onWheel=(e) => {
  var evt = e
  lastWheel=evt.detail? evt.detail*-120 : evt.wheelDelta 
}
if (document.attachEvent) //if IE (and Opera depending on user setting)
  document.attachEvent('on'+mousewheelevt, function(e) {onWheel(e)})
else if (document.addEventListener) //WC3 browsers
  document.addEventListener(mousewheelevt, function(e) {onWheel(e)}, false)
extend({OrbitControls})
const OrbitalControls = ({center,data_range,isOrtho}) => {
  const orbitRef = React.useRef()
  let { camera, gl, scene } = useThree()

  console.log('controls init' +isOrtho )
  let doUpdate = false, updateTarget= true
  if (isOrtho!=lastOrtho) {
    doUpdate=true
    //updateTarget = true
    lastCenter = [-1,-1,-1]
    lastOrtho=isOrtho
    //center = lastCenter
    
    if (camPos) {
      
      updateControls(camera, data_range, center)
      camera.position.set(camPos.x,camPos.y,camPos.z)
      camera.updateProjectionMatrix()
    }


  }else{
    //camera = lastCamera
    //toast('reset cam')
  }
  cam = false
  lastWheel = 0
  
  //console.log(camera)
  const axesRef = React.useRef()
  useFrame(() => {
    
    for (var i = 0; i < 3; i ++)
      if (center[i] != lastCenter[i]) {
        console.log('controls reset center')
        console.log(center)
        console.log(lastCenter)
        orbitRef.current.target.set(...center)
        lastCenter = center
        //updateTarget = true
      }

    
    /*if (!cam && camPos) {
      
      camera.position.set(camPos.x,camPos.y,camPos.z)
      camera.zoom = zoom
      console.log('zoom ' + zoom)
      //camera.updateProjectionMatrix()
      cam = true
      //doUpdate = true
    }*/
    
    
    /*if (!cam) {
      var helper = new THREE.CameraHelper( camera )
      scene.add( helper )
      cam = camera
    }*/
    
    /*
    if (lastWheel != 0) {
      let sign= -Math.sign(lastWheel)
      
      //alert(ratio)
      camera.left += sign*(camera.left/5)
      camera.right += sign*(camera.right/5)
      camera.top += sign*(camera.top/5)
      camera.bottom += sign*(camera.bottom/5)
      camera.updateProjectionMatrix()
      lastWheel = 0
    }*/

      
    for (i = 0; i < data_range.length; i ++) {
      if (data_range[i] != lastDataRange[i]) {
        doUpdate=true
        console.log('controls reset data range')
        lastDataRange=data_range
      }
    }

    if (doUpdate) {
      console.log('controls updated')
      console.log(data_range)
      
      updateControls(camera, data_range, center)

      doUpdate = false
    }

    if (updateTarget && lastTarget) {
      //toast('set')
      orbitRef.current.target.set(lastTarget.x, lastTarget.y,lastTarget.z)
      updateTarget=false
    }

    orbitRef.current.update()
    camPos=camera.position
    axesRef.current.scale.set(1/camera.zoom, 1/camera.zoom,1/camera.zoom)
    lastCamera = camera
    lastTarget = orbitRef.current.target
    var vector = new THREE.Vector3()
    // Bottom left corner
    vector.set( -0.85, -0.85, -0.5).unproject( camera )
    axesRef.current.position.set(vector.x, vector.y, vector.z)
    
  })
  
  let size=0.02
  if (isOrtho) {
    size = 5//75/camera.zoom
    //toast('yes')
  }

  return <><orbitControls
    args={[camera, gl.domElement]}
    enablePan={true}
    enableZoom={true}
    ref={orbitRef}/>
  <axesHelper
    ref = {axesRef}
    attach='geometry'
    args={[
      size
    ]}/></>
}

export default OrbitalControls
