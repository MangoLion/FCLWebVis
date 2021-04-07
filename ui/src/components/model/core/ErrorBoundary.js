import { toast } from 'react-toastify'
import React from 'react'
import { connect } from 'react-redux'

let recursiveParentRemove = (file) => {
  if (file.fileContent)
    delete file.fileContent
  if (file.parentFile)
    delete file.parentFile 
  if (file.alreadyLoaded)
    file.alreadyLoaded = false
  for (var name in file.children) {
    recursiveParentRemove(file.children[name])
  }
}

let stop = false

const saveJSON = (state, notes,errorInfo) => {
  state.file_current = null
  state.notes = notes
  state.errorInfo = errorInfo
  recursiveParentRemove(state)
  var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state))
  var dlAnchorElem = document.getElementById('downloadAnchorElem')
  dlAnchorElem.setAttribute('href',     dataStr     )
  dlAnchorElem.setAttribute('download', 'scene.json')
  dlAnchorElem.click()
  
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false,
      msg:'' }
  }

  
  /*
  static getDerivedStateFromError(error) {    // Update state so the next render will show the fallback UI.    
    return { hasError: true,
      msg:error}  
  }*/
  //alert('called')
    
  componentDidCatch(error, errorInfo) {    // You can also log the error to an error reporting service    
  //  logErrorToMyService(error, errorInfo);  
    //alert('called')
    if (!stop) {
      stop = true
      if (window.confirm('Fatal Error! Dump current state?')) {
        var notes = window.prompt('Enter Notes (Optional):')
        saveJSON(this.props.state, notes,errorInfo)
      }
    }
    this.setState({
      hasError: true,
      msg:error}
    )
  }
  render() {
    if (this.state.hasError) {      // You can render any custom fallback UI      
      
      return <h1>{this.state.msg}</h1>    }
    return this.props.children 
  }
}

const mapStateToProps = (new_state) => {
  return { state: new_state }
} 

export default connect(mapStateToProps)(ErrorBoundary)