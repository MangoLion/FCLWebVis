import React, { useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux'
import set_field from '../../redux/actions/SetField'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'

/**
 * dropdown component that lists the options provided by a variable of a file or task
 * @component
 * @prop {string} name name of the variable
 * @prop {string} values the possible values of the variable 
 * @prop {function} onInputChange mapDispatchToProps callback to dispatch set_field redux action. Will set the "value" attribute of the currently selected file, based on isFileInput flag
 * @prop {Boolean} isFileInput if true, this textfield points to the fileFields of the currently selected file, false if it points to taskFields
 */
let DropdownComponent = ({name, values, value, onInputChange, isFileInput}) => {
  let firstItem
  let selectItems = []
  values.forEach(value => {
    if (!firstItem)
      firstItem = value
    selectItems.push(<MenuItem key={value} value={value}>{value}</MenuItem>)
  })

  
  function humanize(str) {
    var i, frags = str.split('_')
    for (i=0; i<frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1)
    }
    return frags.join(' ')
  }
  
  //    <InputLabel id="select" className="inputLabel">{name}</InputLabel>
  return <div style={{paddingBottom:'25px'}}>

    {/*<label htmlFor="select" className="inputLabel">{humanize(name)}</label>
    <br/>*/}
    <InputLabel id={name}>{humanize(name)}</InputLabel>
    <Select onChange={(e) => onInputChange(e)}
      id={name} 
      labelId={name}
      name={name} 
      key={name+value}
      defaultValue={value}
      label={humanize(name)}
      InputLabelProps={{style: {fontSize: 'medium'}}}
    >
      {selectItems}
    </Select>
  </div>
}

const mapStateToProps = (new_state, ownProps) => {
  //console.log(new_state.file_current)
  //console.log(ownProps.name)
  let updated_fields
  if (ownProps.isFileInput)
    updated_fields = new_state.file_current.fileFields
  else
    updated_fields = new_state.file_current.taskFields
  return { value: updated_fields[ownProps.name].value }
} 

const mapDispatchToProps= (dispatch, ownProps) => (
  {
    onInputChange: (e) => {
        
      //console.log("dispatching: " + ownProps.name+", "+e.target.value);
      dispatch(set_field({
        name: ownProps.name,
        value: e.target.value,
        isFileInput:ownProps.isFileInput
      }))}
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(DropdownComponent) 