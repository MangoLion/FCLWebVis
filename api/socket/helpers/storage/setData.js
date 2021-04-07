const streamlines = require('bindings')('streamlines')
const { STORAGE_DATA_TYPES } = require('../constants/storage')

const setData = (storage, data) => {
  const { id, type, contents,fileContent } = data

  console.log('SETTING DATA')
  console.log(id+ ', ' + type)
  // Parse data
  let buffer = null
  if (contents)
    buffer = Buffer.from(contents, 'utf8')
  var check = false
  storage[id] = (() => {
    switch(type) {
    case STORAGE_DATA_TYPES.VTK_STEADY_VECTORFIELD:
      return streamlines.parseVTK(buffer, buffer.length)
    default:
      console.log('CHECKING')
      console.log(id)
      //console.log(contents)
      check = true
      return fileContent
    }
  })()
  if (check)
    console.log(storage[id])

  if (storage[id] && storage[id].is_error)
    return storage[id].response
}

module.exports = setData
