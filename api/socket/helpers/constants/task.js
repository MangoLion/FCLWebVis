function parse_seeding_points(params) {
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
}

const streamlines = require('bindings')('streamlines')

const TASK_FUNCS = {
  streamline_trace_vtk: (params, data) => {
    params.stepsize = parseFloat(params.stepsize, 10)
    params.length = parseFloat(params.length, 10)
    
    //parse_seeding_points(params)
    params.seeding_points = params.seeding_points.replace(/["'()]/g,'').split(',').map(Number)
    //console.log(params.seeding_points)
    //console.log(data)
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
    params.stepsize = parseFloat(params.stepsize, 10)
    params.length = parseFloat(params.length, 10)
    //console.log(params)

    //console.log(params)
    params.divergent_threshold_min = parseFloat(params.divergent_threshold_min, 10)
    params.divergent_threshold_max = parseFloat(params.divergent_threshold_max, 10)
    //parse_seeding_points(params) 
    params.seeding_points = params.seeding_points.replace(/["'()]/g,'').split(',').map(Number)
    console.log(params.seeding_points)
    var result = streamlines.generateSurfaces(JSON.stringify(params),data)
    result = JSON.parse(result)
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