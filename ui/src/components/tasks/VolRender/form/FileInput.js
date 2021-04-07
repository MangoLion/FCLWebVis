import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Spinner } from 'react-bootstrap'
import FILE_TYPES from './helpers/fileTypes'
import shortid from 'shortid'

const FileForm = ({
  parsing,
  result,
  setState,
}) => {
  const fileInputRef = useRef()
  const typeRef = useRef()

  const getTextDataFromFile = (e) => {
    e.preventDefault()
    const fileCount = e.target.files.length

    if(fileCount === 0) return

    const firstFile = e.target.files[0]

    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const data = e.target.result

      setState((prevState) => ({
        ...prevState,
        parsing: true,
        data,
      }))
    }

    fileReader.readAsText(firstFile, 'utf-8')
  }

  return <Form
    style={{
      padding: 0,
      margin: 0,
      flexGrow: 0,
    }}
    align='center'>
    <Row>
      <Row>
        <Form.File
          label='File'
          accept='.txt, .vtk, .obj'
          onChange={getTextDataFromFile}
          ref={fileInputRef}/>
        <Form.Group>
          <Form.Label>File Data Type</Form.Label>
          <Form.Control
            as='select'
            onChange={() => {
              const type = typeRef.current.value
              console.log(type)
              setState((prevState) => ({
                ...prevState,
                type,
              }))
            }}
            ref={typeRef}>
            {Object.values(FILE_TYPES).map((type) =>
              <option
                key={shortid.generate()}>
                {type}
              </option>)}
          </Form.Control>
        </Form.Group>
      </Row>
      <div>
        {(() => {
          if(parsing && !result)
            return <div>
              Parsing <Spinner animation='border'/>
            </div>
          else if(!parsing && result)
            return 'Parsed'
          else
            return 'No file is chosen'
        })()}
      </div>
    </Row>
  </Form>
}

FileForm.propTypes = {
  type: PropTypes.string,
  data: PropTypes.string,
  parsing: PropTypes.bool,
  result: PropTypes.any,
  setState: PropTypes.func,
}

export default FileForm
