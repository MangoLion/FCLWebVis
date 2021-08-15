/*
Handles new or existing task input parameters. It receives the task parameters and perform the task (in c++ code, using node-addon-api), 
then it returns the task results. (This module does NOT handle IO events, only execute the task from the given parameters!)
*/

const streamlines = require('bindings')('streamlines')

const TASK_FUNCS = {
  //SURFACE TRACE TASK
  streamline_trace_vtk: (params, data) => {
    //extract and parse task input values
    params.stepsize = parseFloat(params.stepsize, 10)
    params.length = parseFloat(params.length, 10)
    //parse_seeding_points(params)  legacy parsing function, ignore
    params.seeding_points = params.seeding_points.replace(/["'()]/g,'').split(',').map(Number)

    //run the task in c++ and get result
    var result = streamlines.generateStreamlines(JSON.stringify(params),data)
    result = JSON.parse(result)

    //convert each streamline.points from 1d to 2d array
    result.streamlines.forEach(line => {
      var points = line.points
      line.points = []
      for (var i = 0; i < points.length; i += 3) {
        line.points.push([points[i],points[i+1],points[i+2]])
      }
    })

    //create response message package to send to web app client
    return {
      is_error:result.is_error,
      response:result.response,
      fileContent: result.streamlines,
      point_data_max: result.point_data_max,
      point_data_min: result.point_data_min
      //vtk: JSON.parse(data.json),
    }
  },
  surface_trace: (params, data) => {
    //extract and parse task input values
    params.stepsize = parseFloat(params.stepsize, 10)
    params.length = parseFloat(params.length, 10)
    params.divergent_threshold_min = parseFloat(params.divergent_threshold_min, 10)
    params.divergent_threshold_max = parseFloat(params.divergent_threshold_max, 10)
    //parse_seeding_points(params)   legacy parsing function, ignore
    params.seeding_points = params.seeding_points.replace(/["'()]/g,'').split(',').map(Number)
    
    //run the task in c++ and get result
    var result = streamlines.generateSurfaces(JSON.stringify(params),data)
    result = JSON.parse(result)

    //create response message package to send to web app client
    return {
      is_error:result.is_error,
      response:result.response,
      fileContent: result.obj,
      point_data_max: result.point_data_max,
      point_data_min: result.point_data_min,
      point_data:result.point_data
      //vtk: JSON.parse(data.json),
    }
  },
  neighbor_find: (params, data) => {
    console.log('BEGIN HERE')
    var result = streamlines.findNeighbors(JSON.stringify(params),data)
    result = JSON.parse(result)
    return {
      is_error:true,
      response:'returned',
      fileContent: ''
      //vtk: JSON.parse(data.json),
    }
  },
}

module.exports = {
  TASK_FUNCS,
}


//Legacy streamlines/streamsurface input parsing (designed to prase "(x,y,z), (x,y,z) ....")
//Replaced with one liner below

/*function parse_seeding_points(params) {
  switch (params.seeding_type) {
  case 'start end':
    params.seeding_points = []
    var pt_start = params.seeding_start.value.split(',').map(Number),
      pt_end = params.seeding_end.value.split(',').map(Number),
      slope = [pt_end[0]-pt_start[0], pt_end[1]-pt_start[1],pt_end[2]-pt_start[2]],
      num = params.seeding_density.val
    for (var i = 0; i < num; i ++) {
      params.seeding_points.push(
        pt_start[0]+(slope[0]/num)*i,pt_start[1]+(slope[1]/num)*i, pt_start[2]+(slope[2]/num)*i
      )
    }
    break
  case 'points':
    params.seeding_points = params.seeding_points.split(',').map(Number)
    break
  }
}*/