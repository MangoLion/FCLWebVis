import React from 'react'
import './App.css'
import {
  Switch,
  Route,
} from 'react-router-dom'
import MainContainer from './tasks/MainContainer'
import MainNavbar from './navbar/NavbarMain'
import { ToastContainer,toast } from 'react-toastify'
import ErrorBoundary from 'components/model/core/ErrorBoundary'

import 'react-toastify/dist/ReactToastify.css'

const Routes = () =>
  <Switch>
    <ErrorBoundary>
      <Route path='/tasks'>
        <App/>
      </Route>
      <Route path='/about'>

      </Route>
    </ErrorBoundary>
  </Switch>

const App = () => {
  return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
    }}>
    {/*<div style={{
      flexGrow: 0,
    }}>
      <MainNavbar/>
  </div>*/}
    <div id='snapshot' style={{position:'fixed', width:'100%',display:'none',backgroundColor:'#8b0000', height:'30px', color:'white', bottom:0}}>Snapshot Mode</div>
    <div style={{
      display: 'flex',
      flexGrow: 1,
    }}>
      <ErrorBoundary>
        <MainContainer/>
      </ErrorBoundary>
    </div>
    <ToastContainer/>
  </div>
}

export default App
