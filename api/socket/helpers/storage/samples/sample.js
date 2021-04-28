const fs = require('fs')
const resourcesPath = '/home/nguyenphan/Insync/thousandlytales@gmail.com/GoogleDrive/FlowVis20/api/socket/helpers/storage/samples'
//server: '/home/nguyenphan/webvis/FlowVis20/api/socket/helpers/storage/samples'
let samples = {}

let addSample= function(name, type) {
  if (!samples[type])
    samples[type] = []
  samples[type].push(name)
}

let readSample=function(name, callback) {
  //var result = fs.readFileSync(`${resourcesPath}/` + name, 'utf8')  
  //return result
  //
  fs.readFile(`${resourcesPath}/` + name, 'utf8', callback)  
}
addSample('bernard3D.ws', 'workspace')
//addSample('cylinder3D.ws', 'workspace')
//addSample('tornado3D.ws', 'workspace')
//addSample('crayfish3D.vtk', 'vectorfield_vtk')
//addSample('plume3D.vtk', 'vectorfield_vtk')
addSample('bernard3D.vtk', 'vectorfield_vtk')
addSample('cylinder3D.vtk', 'vectorfield_vtk')
//addSample('tornado3D.vtk', 'vectorfield_vtk')
//addSample('streamline_points.txt', 'streamlines_txt')
//addSample('streamlines.txt', 'streamlines_txt')
//addSample('boussinesq_surface.obj', 'surface_obj')

module.exports = {
  resourcesPath,
  samples,
  addSample,
  readSample
}
