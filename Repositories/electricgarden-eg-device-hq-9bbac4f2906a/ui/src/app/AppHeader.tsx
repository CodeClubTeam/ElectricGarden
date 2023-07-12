import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useHistory } from "react-router-dom";

export const AppHeader = () => {
  const {
    location: { pathname },
  } = useHistory();
  return (
    <Navbar>
      <Navbar.Brand href="/">EG Device Management</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav activeKey={pathname}>
          <Nav.Link href="/">Dashboard</Nav.Link>
          <Nav.Link href="/devices">Devices</Nav.Link>
          <Nav.Link href="/defaults">Defaults</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};
