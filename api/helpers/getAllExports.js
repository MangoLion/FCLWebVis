const fs = require('fs')
const path = require('path')
const validFileTypes = ['js']

const flatten = (a) =>
  a.reduce((flat, i) => Array.isArray(i)
    ? flat.concat(flatten(i))
    : flat.concat(i),
  [])

const getAllExports = (rootDirectory, notIncludedDirs = ['helpers']) => {
  let allExports = []
  // console.log('root:', rootDirectory)
  const getAllExportsRecursive = (directory) => {
    fs.readdirSync(directory).forEach((fileOrDir) => {
      const curPath = path.join(directory, fileOrDir)
      const isDirectory = fs.lstatSync(curPath).isDirectory()
      if(isDirectory && !notIncludedDirs.includes(fileOrDir)) {
        // console.log('dir:', directory)
        const dirPath = curPath
        getAllExportsRecursive(dirPath)
        return
      }

      const filePath = curPath
      const fileType = filePath.split('.').pop()

      const invalidFile = filePath === 'index.js'
        || directory === rootDirectory
        || !validFileTypes.includes(fileType)

      if(!invalidFile) {
        // console.log('file:', filePath)
        const fileExports = require(filePath)
        allExports.push(fileExports)
      }
    })
  }
  getAllExportsRecursive(rootDirectory)
  // console.log(allExports)
  return flatten(allExports)
}

module.exports = getAllExports
