import React from 'react'
import { connect } from 'react-redux'
import set_field from '../../redux/actions/SetField'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import Slider from '@material-ui/core/Slider'
/**
 * Textfield that automatically updates the value of the desired variable. Also automatically updates its value to reflect changes in the data (for example, when the server responses with the data value)
 * @component
 * @prop {string} name name of the variable
 * @prop {string} value value of the variable
 * @prop {function} onInputChange mapDispatchToProps callback to dispatch set_field redux action. Will set the "value" attribute of the currently selected file, based on isFileInput flag
 * @prop {Boolean} isFileInput if true, this textfield points to the fileFields of the currently selected file, false if it points to taskFields
 */
let SliderComponent = ({name, value, onInputChange, isFileInput, step, max, min}) => {
  function humanize(str) {
    var i, frags = str.split('_')
    for (i=0; i<frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1)
    }
    return frags.join(' ')
  }

  return <div style={{paddingBottom:'25px'}}>
    {/*<label htmlFor="file" className="inputLabel">{humanize(name)}</label>
    <input id={name} name={name} onChange={(e) => onInputChange(e)} type="text" value={value} className="form-control"/>*/}
    <InputLabel id={name}>{humanize(name)}</InputLabel>
    <Slider
      marks
      id={name}
      value={Number(value)}
      onChange={(e,v) => onInputChange(e,v)}
      labelId={name}
      step={Number(step)}
      max={Number(max)}
      min={Number(min)}
    />
  </div>
}

const mapStateToProps = (new_state, ownProps) => {
  let updated_fields
  if (ownProps.isFileInput)
    updated_fields = new_state.file_current.fileFields
  else
    updated_fields = new_state.file_current.taskFields
  return { value: updated_fields[ownProps.name].value }
} 

const mapDispatchToProps= (dispatch, ownProps) => (
  {
    onInputChange: (e,v) => {
      dispatch(set_field({
        name: ownProps.name,
        value: v,//e.target.value,
        isFileInput:ownProps.isFileInput
      }))}
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(SliderComponent) 