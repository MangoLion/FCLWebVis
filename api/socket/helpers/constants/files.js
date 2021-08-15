//Routes for new datasets, trigger when web app upload new dataset, or request to download a sample dataset from processing server
const { STORAGE_DATA_TYPES } = require('./storage')
const FILE_FUNCS = {
  /**
   * file: name, contents
   */
  [STORAGE_DATA_TYPES.VTK_STEADY_VECTORFIELD]: (file) => {
    
  }
}