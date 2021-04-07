const fs = require('fs')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => { // Where incoming file is stored
    cb(null, 'public')
  },
  filename: (req, file, cb) => { // What name is given to incoming file
    cb(null, file.originalname + ' - ' + Date.now())
  },
})

const upload = multer({ storage })

const express = require('express')
const router = express.Router()

const streamlines = require('bindings')('streamlines')
router.use('/upload/vtk', (req, res) => {
  console.log(req)
  const buffer = fs.readFileSync('./data/cylinder3D.txt')
  const size = buffer.length

  // Parse and store C++ file
  console.time('cpp: parse_data')
  const success = streamlines.parseData(buffer, size)
  console.timeEnd('cpp: parse_data')


  upload.single('file')(req, res, (err) => {
    if(err)
      res.status(500).json(err)
    res.status(200).send(req.file)
  })
})

module.exports = router
