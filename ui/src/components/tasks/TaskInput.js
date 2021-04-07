
import React from 'react'
// import {getTaskType} from './../../utilities/taskTypes'
// import {StreamlinesInputs} from './stream_lines/StreamLinesView'
import {StreamlinesTraceInputs} from './streamlines/StreamlineTraceTask'
import {SurfaceTraceInputs} from './streamlines/SurfaceTraceTask'
import {FindNeighborInputs} from './streamlines/FindNeighborTask'
import { connect } from 'react-redux'

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
 * This is a core parent component that will find the corresponding taskInput component of the current file's task to be rendered based on taskType. Or null if the tasktype doesnt have any input components, or the current file does not belong to a task(root files)
 * @component
 * @prop {object} file the current file
 */
let TaskInput = ({file}) => {
  const classes = useStyles()
  if (!file || !file.taskType)
    return null
    
  let type = file.taskType
  const components = {
    streamline_trace_vtk: StreamlinesTraceInputs,
    streamline_trace_txt: () => null,
    streamline_negate: () => null,
    surface_trace: SurfaceTraceInputs,
    volume_render_vtk: () => null,
    neighbor_find: FindNeighborInputs
  }

  let Component = components[type]

  function humanize(str) {
    var i, frags = str.split('_')
    for (i=0; i<frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1)
    }
    return frags.join(' ')
  }
  let displayVars = ''
  if (file.parentFile.id != 'root')
    displayVars = 'Dataset: ' + file.parentFile.id + '\n'
  for (var name in file.parentFile.fileFields) {
    var v = file.parentFile.fileFields[name]
    if (v.doDisplay) {
      displayVars += humanize(name) + ': ' + v.value + '\n'
    }
  }
  displayVars = displayVars.split ('\n').map ((item, i) => <p style={{fontSize:'small'}} key={i}>{item}</p>)

  {/*return <div>
    <h3>{type}</h3>
    {displayVars}
    <Component file={file} />
  </div>*/}
  return <div style={{paddingTop:'25px'}}>
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          Task Parameters
        </Typography>
        <Typography variant="h5" component="h2">
          {file.id}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {'task type: '+type}
        </Typography>
        <Typography variant="body2" component="p">
          {displayVars}
        </Typography>
        <Component isFileInput={true} file={file} />
      </CardContent>
    </Card>
  </div>

}

const mapStateToProps = (newState) => {
  if (!newState)
    return{}
  return { file: newState.file_current }
} 

export default connect(mapStateToProps)(TaskInput)
