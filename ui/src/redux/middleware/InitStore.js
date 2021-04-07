import { createStore } from 'redux'
//import loadWorkspace from '../actions/loadWorkspace'
import task_app from '../reducers/Reducers'
//import data from './data.json'

/**
 * Create the redux store and initialize the client's state
 */
export default function initializeStore() {
  /* let initialState = {
    task_current: null,
    children: {}
  }*/

  let store = createStore(task_app)

  //initialize store with default fields
  //store.dispatch(loadWorkspace(data))

  return store
}