import Slider from '@material-ui/core/Slider'
import React,{useState} from 'react'
import { connect } from 'react-redux'

let SliderInput = ({name, value, max, min}) => {
  let abc = undefined

  return <>
    <label htmlFor={name} className="inputLabel">{name}</label>
    <Slider name={name} step={1} min={0} max={5} marks/>
  </>
}

export default SliderInput