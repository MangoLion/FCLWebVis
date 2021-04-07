import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

import * as THREE from 'three'
import { VolumeRenderShader1 } from 'three/examples/jsm/shaders/VolumeShader'
import { useUpdate } from 'react-three-fiber'

import cmViridis from 'assets/textures/cm_viridis.png'
import cmGray from 'assets/textures/cm_gray.png'
const textures = {
  viridis: new THREE.TextureLoader().load(cmViridis),
  gray: new THREE.TextureLoader().load(cmGray),
}

const Volume = ({ vtk, options }) => {
  const dataTexture = useMemo(() => {
    // console.log('Preparing dataTexture')
    console.log(vtk.point_data)
    const volume_data = vtk.point_data // vtk.velocity_data.map(([x, ...rest]) => x)
    const dataTexture = new THREE.DataTexture3D(
      new Float32Array(volume_data), // Needs to be Float32Array
      vtk.dims[0],
      vtk.dims[1],
      vtk.dims[2]
    )
    dataTexture.format = THREE.RedFormat
    dataTexture.type = THREE.FloatType
    dataTexture.minFilter = THREE.LinearFilter
    dataTexture.magFilter = THREE.LinearFilter
    dataTexture.unpackAlignment = 1
    dataTexture.needsUpdate = true

    return dataTexture
  }, [vtk])
  console.log(options)
  const shaderMaterialArgs = useMemo(() => {
    // console.log('Preparing shaderMaterialArgs')
    const shader = {
      ...VolumeRenderShader1,
      ...options.vertexShader ? {vertexShader: options.vertexShader} : {},
      ...options.fragmentShader ? {fragmentShader: options.fragmentShader} : {},
    }
    let uniforms = THREE.UniformsUtils.clone(shader.uniforms)

    const { u_clim, u_renderstyle, u_renderthreshold, u_cmdata } = options.uniforms
    uniforms.u_data.value = dataTexture
    uniforms.u_size.value = new THREE.Vector3(...vtk.dims)
    uniforms.u_clim.value = u_clim ? new THREE.Vector2(...u_clim) : new THREE.Vector2(0, 1)
    uniforms.u_renderstyle.value = u_renderstyle || 0 // 0: MIP, 1: ISO
    uniforms.u_renderthreshold.value = u_renderthreshold || 0.15 // For ISO renderstyle
    uniforms.u_cmdata.value = u_cmdata || new THREE.TextureLoader().load(cmViridis)
    console.log(uniforms)
    return {
      ...shader,
      uniforms,
      side: THREE.BackSide,
    }
  }, [
    dataTexture, vtk,
    options.vertexShader,
    options.fragmentShader,
    options.uniforms.u_renderthreshold])

  const geometryRef = useUpdate((geometry) => {
    // console.log('Geometry Update')
    geometry.translate(
      vtk.dims[0] / 2 - 0.5,
      vtk.dims[1] / 2 - 0.5,
      vtk.dims[2] / 2 - 0.5,
    )
  }, [vtk.dims])

  const materialRef = useUpdate((material) => {
    console.log('Material Update')
    const { u_clim, u_renderstyle, u_renderthreshold, u_cmdata } = options.uniforms
    material.uniforms.u_clim.value = new THREE.Vector2(...u_clim)
    material.uniforms.u_renderstyle.value = u_renderstyle
    material.uniforms.u_renderthreshold.value = u_renderthreshold 
    material.uniforms.u_cmdata.value = u_cmdata
  }, [options.uniforms])

  return <mesh>
    <boxBufferGeometry
      attach='geometry'
      ref={geometryRef}
      args={[...vtk.dims]}/>
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