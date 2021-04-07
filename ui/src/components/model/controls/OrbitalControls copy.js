import React,{useState} from 'react'
import * as THREE from 'three'
import { extend, useThree, useFrame} from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let lastCenter = [-1,-1,-1]
let cam = false
let lastWheel = 0

var mousewheelevt=/Firefox/i.test(navigator.userAgent)? 'DOMMouseScroll' : 'mousewheel' //FF doesn't recognize mousewheel as of FF3.x
let onWheel=(e) => {
  var evt = e
  lastWheel=evt.detail? evt.detail*-120 : evt.wheelDelta 

  console.log(lastWheel)
  
}
if (document.attachEvent) //if IE (and Opera depending on user setting)
  document.attachEvent('on'+mousewheelevt, function(e) {onWheel(e)})
else if (document.addEventListener) //WC3 browsers
  document.addEventListener(mousewheelevt, function(e) {onWheel(e)}, false)
extend({OrbitControls})
const OrbitalControls = ({center}) => {
  const orbitRef = React.useRef()
  const { camera, gl, scene } = useThree()

  console.log('CAMERA' )
  console.log(camera)
      
  const axesRef = React.useRef()
  useFrame(() => {
    /*
    let ww = window.innerWidth
    let hh = window.innerHeight
    camera.aspect = ww/hh
    camera.left = -ww
    camera.right = ww
    camera.top = hh
    camera.bottom = -hh
    camera.near = -1000
    camera.updateProjectionMatrix()*/
    if (!cam) {
      var helper = new THREE.CameraHelper( camera )
      scene.add( helper )
      cam = camera
    }

    if (lastWheel != 0) {
      if (lastWheel > 0) {
        camera.translateZ(30)
      }else{
        camera.translateZ(-30)
      }
      lastWheel = 0
    }

    for (var i = 0; i < 3; i ++)
      if (center[i] != lastCenter[i]) {
        //alert('updated')
        orbitRef.current.target.set(...center)
        lastCenter = center
      }
    orbitRef.current.update()
    var vector = new THREE.Vector3()
    // Bottom left corner
    vector.set( -0.85, -0.85, -0.5).unproject( camera )
    axesRef.current.position.set(vector.x, vector.y, vector.z)
  })

  return <><orbitControls
    args={[camera, gl.domElement]}
    enablePan={false}
    enableZoom={false}
    ref={orbitRef}/>
  <axesHelper
    ref = {axesRef}
    attach='geometry'
    args={[
      0.02
    ]}/></>
}

export default OrbitalControls
