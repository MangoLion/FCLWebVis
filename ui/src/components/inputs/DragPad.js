import React,{useState} from 'react'
import { connect } from 'react-redux'
import Slider from '@material-ui/core/Slider'
let DragPad = ({name, value, min, max}) => {
  const Sty1={
    height:'100px',
    width: '100px',
    borderStyle: 'dashed',
    borderColor: 'yellow',
    backgroundColor: 'gray'
  }

  const [isDown, setDown] = useState(false)
  const [lastPos, setlastPos] = useState(false)

  let mouseDown = () => {
    setDown(true)
  }

  let mouseUp = () => {
    setDown(false)
  }

  let mouseMove = (e) => {
    if (isDown) {
      
      if (lastPos) {
        var mx = e.pageX - lastPos[0],
          my = e.pageY - lastPos[1]
        console.log('moved ' + mx+ ', '+my)
      }
      setlastPos([e.pageX,e.pageY])
    }
  }

  return <div style={Sty1} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove}/>
}

export default DragPad