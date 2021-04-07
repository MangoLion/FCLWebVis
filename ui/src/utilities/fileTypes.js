let fileTypes = {}

let registerFileType = (file) => {
  if (!file.fields) {
    alert('Validation error: file type must have fields attribute!')
    return
  }
  //default fields
  file = {
    sendToServer:true,
    alreadyLoaded: false,
    ...file
  }
  fileTypes[file.name] = file
  
}

let getFileType = (name) => {
  return fileTypes[name]
}

let getFileTypes = () => {
  return fileTypes
}

let applyFileType = (file, strFileType) => {
  file.fileType = strFileType
  if (!file.fileFields)
    file.fileFields = {}

  file.fileFields = {
    ...file.fileFields,
    ...fileTypes[strFileType].fields,
  }

  //if (!file.center)
  //  file.center = [0,0,0]
  
}

export {
  registerFileType,
  getFileTypes,
  getFileType,
  applyFileType
}