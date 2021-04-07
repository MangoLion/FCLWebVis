import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'

const MainNavbar = () => {
  return <Navbar>
    <Navbar.Brand>Vector Analysis</Navbar.Brand>
    <Nav>
      <Nav.Link
        as={RouterLink}
        to='/tasks'>Tasks</Nav.Link>
      <Nav.Link
        as={RouterLink}
        to='/about'>About</Nav.Link>
    </Nav>
  </Navbar>
}

export default MainNavbar
