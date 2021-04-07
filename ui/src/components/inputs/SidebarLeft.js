import React, { Component } from 'react'
import SubmitComponent from './SubmitComponent'
import TaskInput from 'components/tasks/TaskInput'
import FileInput from 'components/tasks/FileInput'
import TreeWindow from './TreeWindow'
import SaveLoadDialogue from './SaveLoadDialogue'

/**
 * Holds the major components that are stored in the sidebar: TreeWindow, TaskInput, FileInput, SubmitComponent
 */
class Sidebar extends Component {
  render() {
    //<TaskDropdown/>
    return <div className='sidebarLeft'>
      <TaskInput />
      <SubmitComponent />
    </div>
  }
}
export default Sidebar