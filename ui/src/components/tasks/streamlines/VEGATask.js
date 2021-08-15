import React from 'react'
//import FileForm from './form/FileInput'
import InputComponent from '../../inputs/InputComponent'
import DragPad from '../../inputs/DragPad'
import SliderInput from '../../inputs/SliderInput'
import DropdownComponent from '../../inputs/DropdownComponent'
import ColorSchemeDropdown from '../../inputs/ColorSchemeDropdown'
import { connect } from 'react-redux'
import {registerTaskType} from '../../../utilities/taskTypes'
import {registerFileType} from '../../../utilities/fileTypes'
import set_field from '../../../redux/actions/SetField'
import { Button} from 'react-bootstrap'
import SeedingCurve from 'components/model/core/SeedingCurve'

const createEmbedVega = (config) => {
  window.vegaEmbed('#vis', config)
    // result.view provides access to the Vega View API
    .then(result => console.log(result))
    .catch(console.warn)
}

const renderVEGA = (task_data, parseData, vegaConfig) => {
  //alert("return " + document.getElementById("editor").textContent);
  let gscript = 'return ' + parseData.replaceAll('\n', '')//document.getElementById('editor').textContent.replaceAll('\n', '')
  var script = new Function(gscript)()
  var data = script(task_data)
  var config = vegaConfig//document.getElementById('vleditor').textContent
  config = JSON.parse(config)
  config.data = data
  createEmbedVega(config)
}

const init = () => {
  registerTaskType({   
    name: 'vegalite',
    sendToServer: false,
    init:(parentFile, taskFields) => {
      console.log('PARENT:')
      console.log(parentFile)
    },
    fields: {
      parse_data:{
        name:'parse_data',
        value:'',
        manual_update: true
      },
      vega_config:{
        name:'vega_config',
        value:'',
        manual_update: true
      }
    },    
    inputFileType: 'streamlines_array',
    outputFileType: 'vegavis',
    onSubmit: function(dispatch, file) {
      var data = file.parentFile.fileContent
      /*console.log(file)
      console.log('DATA: ')
      console.log(data)*/
      renderVEGA(data, file.taskFields.parse_data.value, file.taskFields.vega_config.value)
    },
    onExport: function(file) {
      var data = file.parentFile.fileContent

      var result = {
        data:data,
        parseData: file.taskFields.parse_data.value,
        vegaConfig: file.taskFields.vega_config.value
      }
        
      return JSON.stringify(result)
    }
  })

  registerFileType({
    name: 'vegavis',
    fields: {
    },
    sendToServer: false,
    
  })
}

init()

let VegaLiteView = ({task }) => {

  return null
}

let VegaLiteInputs = ({ dispatch, task }) => {
  let loadFileAsConfig = function() {
    var fileToLoad = document.getElementById('fileToLoad').files[0]

    var fileReader = new FileReader()
    fileReader.onload = function(fileLoadedEvent) {
      var textFromFileLoaded = fileLoadedEvent.target.result
      //alert(textFromFileLoaded);
      var data = JSON.parse(textFromFileLoaded)

      dispatch(set_field({
        name: 'parse_data',
        isFileInput: false,
        value:data.parseData
      }))

      dispatch(set_field({
        name: 'vega_config',
        isFileInput: false,
        value:data.vegaConfig
      }))

    }

    fileReader.readAsText(fileToLoad, 'UTF-8')
  }

  return <div>
    <InputComponent name="parse_data"  isFileInput={false}/>
    <InputComponent name="vega_config"  isFileInput={false}/>
    <input type="file" id="fileToLoad"></input>
    <Button onClick={loadFileAsConfig}>Upload Configuration</Button>
  </div>
}

VegaLiteInputs=connect()(VegaLiteInputs)

let VegaVisView = ({ file }) => {

  return null
}
let VegaVisInputs = ({ file }) => {

  return null
}
export {
  VegaLiteView,
  VegaLiteInputs,
  VegaVisView,
  VegaVisInputs
}
