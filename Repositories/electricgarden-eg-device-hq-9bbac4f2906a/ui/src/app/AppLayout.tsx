import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { AppHeader } from "./AppHeader";

export const AppLayout: React.FC = ({ children }) => (
  <Container fluid>
    <Row>
      <AppHeader />
    </Row>
    <Row>{children}</Row>
  </Container>
);
