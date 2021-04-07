
import React from 'react'
// import {getTaskType} from './../../utilities/taskTypes'
import {StreamLinesViewTXT, StreamLinesViewArray, StreamLinesTraceView,VTKView} from './streamlines/StreamLinesView'
import SurfaceView from './../model/obj/ObjFile'
import Volume from './VolRender/models/volume/Volume'
import BoundingBox from 'components/model/core/BoundingBox'
import { SurfaceTraceView } from './streamlines/SurfaceTraceTask'
import { FindNeighborView ,SegmentMapView} from './streamlines/FindNeighborTask'

/**
 * This is a core component that will find the corresponding display component of the current file to be rendered based on fileType. Or null if the fileType doesnt have any input components, or the current file does not have any display component
 * @component
 * @prop {object} file the current file
 * @prop {number} render_count incremented when user press Render
 */
let Visualizer = ({dispatch, file, task, render_count}) => {
  if ((!file || !file.fileType) && (!task || !task.taskType))
    return null
    //console.log("Visualizer re-rendered:"+file.name);
  let type = file? file.fileType:task.taskType
  //console.log(type)
  const components = {
    vectorfield_vtk:VTKView,
    streamlines_txt: StreamLinesViewTXT,
    streamlines_array: StreamLinesViewArray,
    streamline_trace_vtk: StreamLinesTraceView,
    surface_trace:SurfaceTraceView,
    surface_obj: SurfaceView,
    volume_render:Volume,
    neighbor_find:FindNeighborView,
    segment_map:SegmentMapView
  }
  let BBox=null
  if (file && file.fileFields.data_range && file.fileFields.origin) {
    var sumRange = file.fileFields.data_range.value.reduce(function(a, b) {
      return Math.abs(a + b)
    }, 0)
    //console.log(sumRange)
    if(sumRange > 0) {
    //alert('yes')
      let origin = file.fileFields.origin.value,
        data_range = file.fileFields.data_range.value
        
      BBox = <BoundingBox origin={origin} data_range={data_range}/>
    }
  }

  if (!components[type])
    return BBox

  let Component = components[type]

  return <group>
    {BBox}
    <Component dispatch = {dispatch} file={file} task={task}render_count={render_count} /></group>
}

/*
  const mapStateToProps = (newState) => {
    if (!newState)
        return{}
    return { file: newState.file_current };
  } 
*/

export default Visualizer//connect(mapStateToProps)(Visualizer);