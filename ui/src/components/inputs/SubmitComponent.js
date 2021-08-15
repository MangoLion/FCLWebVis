import React from 'react'
import { connect } from 'react-redux'
import {getIoInstance} from './../../utilities/ioInstance'
// import {addFileName} from './../../utilities/taskHandler'
import {Modal, Button} from 'react-bootstrap'
import set_loaded from './../../redux/actions/SetAlreadyLoaded'
import call_render from './../../redux/actions/RenderCall'
import {getTaskType} from './../../utilities/taskTypes'

import CircularProgress from '@material-ui/core/CircularProgress'
import { toast } from 'react-toastify'
/**
 * Submit button that loops through each attribute in the currently selected file's taskFields and send them to the server.
 * It only appears when the currently selected file is from a task
 */
class SubmitComponent extends React.Component {
    
  constructor(props) {
    super(props)
    this.state = { show: false,sending:props.sending, processing:props.processing, receiving:props.receiving }
    this.handleClose = this.handleClose.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  /**
     * Callback that allows the user to close the progress dialogue (even when the server hasn't finished processing or sending the file back yet)
     */
  handleClose() {
    this.setState((state) => ({
      ...state,
      show: false
    }))
  }

  /**
     * This component usually only update when the server has finished sending back the task's results
     */
  componentDidUpdate(prevProps) {
    if (!this.props.progress)
      return

    if (this.props.progress.sending > 0 || this.props.progress.progressing > 0) {
      if (!this.state.show) {
        //alert('showing')
        this.setState((state) => ({
          ...state,
          show: true
        }))
      }
      else
        return
    }

    //if (this.props.progress.receiving === 100) {
    if (this.props.progress.sending == 0 && this.props.progress.processing== 0 && this.props.progress.receiving == 0 && this.state.show) {
      this.setState((state) => ({
        ...state,
        show: false
      }))
    }

    if (!prevProps.progress || prevProps.progress.receiving === this.props.progress.receiving) {
      return
    }
      
    
  }

  /**
     * Send all the fields in current file's taskFields to the server
     */
  onSubmit() {
    if (!this.props.task_name)
      return

    ///
    if (this.props.task.onSubmit) {
      //alert('yes')
      this.props.task.onSubmit(this.props.dispatch, this.props.task)
    }
    ///

    //console.log(this.props.task)
    if (!getTaskType(this.props.task_name).sendToServer || !this.props.task_params_changed) {
      this.props.dispatch(call_render())
      return
    }
    
    if (this.props.task.onSubmit) {
      //alert('yes')
      //this.props.task.onSubmit(this.props.dispatch, this.props.task)
    }

    let obj_message = {
      name: this.props.task_name,
      id:this.props.task.id,
      params:{},
      data:{
        id: this.props.fileName,
        contents:false
      }
    }
    if (!this.props.alreadyLoaded) {
      obj_message.data.contents = this.props.fileContent
    }
    //console.log(this.props.fields)
    for (let field in this.props.task.taskFields) {
      //if (!this.props.fields[field].sendToServer)
      //continue;

      obj_message.params[field] = this.props.task.taskFields[field].value
      if (obj_message.params[field].value === '') {
        alert('missing data!')
        return
      }

      /*if (obj_message[field].fileName != "")
            addFileName({
              name: field,
              fileName: obj_message[field].fileName
            })*/
    }
    //console.log("sending")
    //console.log(obj_message);
    getIoInstance().emit('task submit', obj_message)
    
    this.setState((state) => ({
      ...state,
      show: true
    }))
  }

  render() {
    if (this.props.snapshotMode)
      return null

    //if (!this.props.task_name)
    //return null
    let submitBt
    if (!this.props.task_name)
      submitBt = null
    else
      submitBt = <Button id="applyBt" onClick={this.onSubmit} variant="primary" size="lg" block>Apply</Button>

    if (!this.props.progress)
      return null
    return <div>
      <>
        {submitBt}
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Submiting Data</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{align:'center'}}>
            <h3>Sending: </h3>
            {this.props.sending != 100?<CircularProgress/>:<div>✅</div>}
            <br/>
            <h3>Processing: </h3>
            {this.props.processing != 100?<CircularProgress/>:<div>✅</div>}
            <br/>
            <h3>Receiving: </h3>
            {this.props.receiving != 100 ?<CircularProgress/>:<div>✅</div>}
            <br/>

            {/*JSON.stringify(this.props.progress)*/}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    </div>
  }
}

  
const mapStateToProps = (state) => {
  if (!state || !state.file_current)
    return{ }

  return {
    task_params_changed:state.task_params_changed,
    task:state.file_current,
    task_name: state.file_current.taskType,
    //fields:state.file_current.taskFields,
    fileContent: state.file_current.parentFile.fileContent,
    fileName: state.file_current.parentFile.name,
    alreadyLoaded: state.file_current.parentFile.alreadyLoaded,
    progress: state.progress,
    sending: state.progress.sending,
    processing: state.progress.processing,
    receiving: state.progress.receiving,
    snapshotMode: state.snapshotMode
  }
}

export default connect(mapStateToProps)(SubmitComponent)