import * as THREE from 'three'
import {box3Helper} from 'three'
import { useUpdate } from 'react-three-fiber'
import React, { useState, useMemo } from 'react'

const BoundingBox = ({origin, data_range}) => {
  const boxRef = useMemo(() => {
    // check if all necessary data is there to render bounding box
    //console.log(file)
    if(!origin || !data_range)
      return null

    const oX = 0, oY = 1, oZ = 2
    const minX = 0, minY = 2, minZ = 4
    const maxX = 1, maxY = 3, maxZ = 5

    const box = new THREE.Box3()
    box.setFromPoints([
      new THREE.Vector3(
        origin[oX] + data_range[minX],
        origin[oY] + data_range[minY],
        origin[oZ] + data_range[minZ]),
      new THREE.Vector3(
        origin[oX] + data_range[maxX],
        origin[oY] + data_range[minY],
        origin[oZ] + data_range[minZ]),
      new THREE.Vector3(
        origin[oX] + data_range[minX],
        origin[oY] + data_range[maxY],
        origin[oZ] + data_range[minZ]),
      new THREE.Vector3(
        origin[oX] + data_range[minX],
        origin[oY] + data_range[minY],
        origin[oZ] + data_range[maxZ]),
      new THREE.Vector3(
        origin[oX] + data_range[maxX],
        origin[oY] + data_range[maxY],
        origin[oZ] + data_range[minZ]),
      new THREE.Vector3(
        origin[oX] + data_range[maxX],
        origin[oY] + data_range[minY],
        origin[oZ] + data_range[maxZ]),
      new THREE.Vector3(
        origin[oX] + data_range[minX],
        origin[oY] + data_range[maxY],
        origin[oZ] + data_range[maxZ]),
      new THREE.Vector3(
        origin[oX] + data_range[maxX],
        origin[oY] + data_range[maxY],
        origin[oZ] + data_range[maxZ]),
    ])

    return box
  }, [])
  const boxColor = useMemo(() => new THREE.Color(0x000000), [])

  return <group>{boxRef &&
    <box3Helper
      args={[
        boxRef,
        boxColor,
      ]}/>}</group>
}

export default BoundingBox