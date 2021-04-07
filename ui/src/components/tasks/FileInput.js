
import React from 'react'
// import {getFileType} from './../../utilities/fileTypes'
import {StreamlinesInputs} from './streamlines/StreamLinesView'
import {VolumeRenderInputs} from './streamlines/VolumeRenderView'
import {SurfaceObjInputs} from './streamlines/SurfaceTraceTask'
import {SegmentMapInputs} from './streamlines/FindNeighborTask'
import { connect } from 'react-redux'
import {Modal, Button} from 'react-bootstrap'
import call_render from 'redux/actions/RenderCall'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import { makeStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
})


/**
 * This is a core parent component that will find the corresponding fileInput component of the current file to be rendered based on fileType. Or null if the filetype doesnt have any input components
 * @component
 * @prop {object} file the current file
 * @prop {function} updateRender callback from mapDispatchToProps that will trigger call_render redux action to redraw all selected files
 */
let FileInput = ({file, render_count, updateRender}) => {
  const classes = useStyles()

  if (!file || !file.fileType)
    return null

  let type = file.fileType
  const components = {
    vectorfield_txt: () => null,
    vectorfield_vtk: () => null,
    streamlines_txt: StreamlinesInputs,
    streamlines_array: StreamlinesInputs,
    surface_obj: SurfaceObjInputs,
    volume_render:VolumeRenderInputs,
    segment_map:SegmentMapInputs
  }

  function humanize(str) {
    var i, frags = str.split('_')
    for (i=0; i<frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1)
    }
    return frags.join(' ')
  }

  let displayVars = ''
  for (var name in file.fileFields) {
    var v = file.fileFields[name]
    if (v.doDisplay) {
      displayVars += humanize(name) + ': ' + v.value + '\n'
    }
  }
  displayVars = displayVars.split ('\n').map ((item, i) => <p key={i}>{item}</p>)
  let Component = components[type]

  let BtRender = null
  if (!document.getElementById('applyBt'))
    BtRender = <Button id="applyBt" onClick={updateRender} variant="primary" size="lg" block>Apply</Button>

  {/*return <div style={{paddingTop:'25px'}} >
    <h3 >{type}</h3>

    {displayVars}
    <br/>
    <Component isFileInput={true} file={file} />
    <Button variant="contained" onClick={updateRender}>Render</Button>
    </div>*/}
  
  return <div style={{paddingTop:'25px'}}>
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          DataSet/Render Options
        </Typography>
        <Typography variant="h5" component="h2">
          {file.id}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {'type: '+type}
        </Typography>
        <Typography variant="body2" component="p">
          {displayVars}
        </Typography>
        <Component isFileInput={true} file={file} />
        
      </CardContent>
    </Card>
    {BtRender}
  </div>
}

const mapStateToProps = (newState) => {
  if (!newState)
    return{}
  return { file: newState.file_current, render_count:newState.render_count }
} 

const mapDispatchToProps= (dispatch) => (
  {
    updateRender: () => {
      dispatch(call_render())
    }
  }
)
 
export default connect(mapStateToProps, mapDispatchToProps)(FileInput)
