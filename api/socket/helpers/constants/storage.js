const STORAGE_DATA_TYPES = {
  VTK_STEADY_VECTORFIELD: 'vectorfield_vtk',
}

//data_type = GET_STORAGE_DATA_TYPE[task_name]
const GET_STORAGE_DATA_TYPE={
  'streamline_trace_vtk ': STORAGE_DATA_TYPES.VTK_STEADY_VECTORFIELD,
  'surface_trace':STORAGE_DATA_TYPES.VTK_STEADY_VECTORFIELD
}

const uniqueObjValues = require('../../../helpers/uniqueObjValues')
uniqueObjValues(STORAGE_DATA_TYPES)

module.exports = {
  STORAGE_DATA_TYPES,
  GET_STORAGE_DATA_TYPE
}