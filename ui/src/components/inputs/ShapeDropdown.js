import React from 'react'
import DropdownComponent from './DropdownComponent'
let ShapeDropdown = () => {

  return <DropdownComponent name="shape"  values={['LINE', 'POINT', 'TUBE']} isFileInput={true} />
}

export default ShapeDropdown