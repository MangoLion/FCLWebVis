import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import * as THREE from 'three'
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader'
import { useUpdate } from 'react-three-fiber'
import { connect } from 'react-redux'

import cmViridis from 'assets/textures/cm_viridis.png'
import cmGray from 'assets/textures/cm_gray.png'
const textures = {
  viridis: new THREE.TextureLoader().load(cmViridis),
  gray: new THREE.TextureLoader().load(cmGray),
}

const Volume = ({ file }) => {
  let vtk_fields = file.parentFile.fileFields, 
    option_fields = file.fileFields
  const dataTexture = useMemo(() => {
    // console.log('Preparing dataTexture')
    //console.log(vtk_fields.point_data.value)
    var pt_data = vtk_fields.point_data.value
    var point_data = []
    for (var i = 0; i < pt_data.length; i +=3) {
      point_data.push([pt_data[i],pt_data[i+1],pt_data[i+2]])
    }
    const volume_data = point_data.map(([x, ...rest]) => x)//vtk_fields.point_data.value//vtk.point_data // vtk.velocity_data.map(([x, ...rest]) => x)
    const dataTexture = new THREE.DataTexture3D(
      new Float32Array(volume_data), // Needs to be Float32Array
      vtk_fields.dims.value[0],
      vtk_fields.dims.value[1],
      vtk_fields.dims.value[2]
    )
    dataTexture.format = THREE.RedFormat
    dataTexture.type = THREE.FloatType
    dataTexture.minFilter = THREE.LinearFilter
    dataTexture.magFilter = THREE.LinearFilter
    dataTexture.unpackAlignment = 1
    dataTexture.needsUpdate = true

    return dataTexture
  }, [vtk_fields])

  const shaderMaterialArgs = useMemo(() => {
    // console.log('Preparing shaderMaterialArgs')
    const shader = {
      ...VolumeRenderShader1,
      //...options.vertexShader ? {vertexShader: options.vertexShader} : {},
      //...options.fragmentShader ? {fragmentShader: options.fragmentShader} : {},
    }
    let uniforms = THREE.UniformsUtils.clone(shader.uniforms)
    var u_clim=[option_fields.clim_min.value, option_fields.clim_max.value]
    var renderstyle = option_fields.renderstyle.value=='MIP'?0:1
    //const { u_clim, u_renderstyle, u_renderthreshold, u_cmdata } = options.uniforms
    uniforms.u_data.value = dataTexture
    uniforms.u_size.value = new THREE.Vector3(...vtk_fields.dims.value)
    uniforms.u_clim.value = u_clim ? new THREE.Vector2(...u_clim) : new THREE.Vector2(0, 1)
    uniforms.u_renderstyle.value = renderstyle// 0: MIP, 1: ISO
    uniforms.u_renderthreshold.value = option_fields.renderthreshold.value || 0.15 // For ISO renderstyle
    uniforms.u_cmdata.value = textures[option_fields.cmdata.value] //u_cmdata || new THREE.TextureLoader().load(cmViridis)
    //console.log(uniforms)
    return {
      ...shader,
      uniforms,
      side: THREE.BackSide
    }
  }, [
    dataTexture, option_fields,
    //options.vertexShader,
    //options.fragmentShader,
    option_fields.renderthreshold])

  
  var range = vtk_fields.data_range.value
  //alert(range)
  //var ratio = (range[3]-range[2])/vtk_fields.dims.value[1]
  var ratio = [(range[1]-range[0])/vtk_fields.dims.value[0],
    (range[3]-range[2])/vtk_fields.dims.value[1],
    (range[5]-range[4])/vtk_fields.dims.value[2]]


  const geometryRef = useUpdate((geometry) => {
    // console.log('Geometry Update')
    geometry.translate(
      vtk_fields.dims.value[0] / 2 - 0.5,
      vtk_fields.dims.value[1] / 2 - 0.5,
      vtk_fields.dims.value[2] / 2 - 0.5,
    )
    
    //geometry.computeBoundingSphere()
    //geometry.scale(ratio[0], ratio[1],ratio[2])
  }, [vtk_fields.dims.value])

  const materialRef = useUpdate((material) => {
    //console.log('Material Update')
    //const { u_clim, u_renderstyle, u_renderthreshold, u_cmdata } = options.uniforms
    var u_clim=[option_fields.clim_min.value, option_fields.clim_max.value]
    var renderstyle = option_fields.renderstyle.value=='MIP'?0:1
    material.uniforms.u_clim.value = new THREE.Vector2(...u_clim)
    material.uniforms.u_renderstyle.value = renderstyle
    material.uniforms.u_renderthreshold.value = option_fields.renderthreshold.value 
    material.uniforms.u_cmdata.value = textures[option_fields.cmdata.value]//u_cmdata
    /*material.uniforms.u_size={
      type:'v3',
      value: [vtk_fields.dims.value[0]*ratio[0],vtk_fields.dims.value[1]*ratio[1],vtk_fields.dims.value[2]*ratio[2]]
    }*/

  }, [option_fields])


  return <mesh scale={new THREE.Vector3( ...ratio)}>
    <boxBufferGeometry
      attach='geometry'
      ref={geometryRef}
      args={[...vtk_fields.dims.value]}/>
    <shaderMaterial
      attach='material'
      ref={materialRef}
      {...shaderMaterialArgs}/>
    {/* <meshBasicMaterial
      color={0x0000FF}/> */}
  </mesh>
}

Volume.propTypes = {
  vtk: PropTypes.shape({
    dims: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    point_data: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  }),
  options: PropTypes.shape({
    vertexShader: PropTypes.string,
    fragmentShader: PropTypes.string,
    uniforms: PropTypes.shape({
      u_clim: PropTypes.arrayOf(PropTypes.number.isRequired),
      u_renderstyle: PropTypes.number,
      u_renderthreshold: PropTypes.number,
      u_cmdata: PropTypes.instanceOf(THREE.Texture)
    })
  }),
}

export default Volume