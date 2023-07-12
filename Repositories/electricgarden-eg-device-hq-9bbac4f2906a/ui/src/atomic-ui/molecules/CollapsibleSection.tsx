import React from "react";
import Accordion from "react-bootstrap/esm/Accordion";
import Card from "react-bootstrap/esm/Card";
import styled from "styled-components/macro";

type Props = {
  name: string;
  header: React.ReactNode;
  children: React.ReactNode;
};

const ClickHeader = styled.h4`
  cursor: pointer;
`;

export const CollapsibleSection = ({ header, name, children }: Props) => (
  <Card>
    <Card.Header>
      <Accordion.Toggle as={ClickHeader} eventKey={name}>
        {header}
      </Accordion.Toggle>
    </Card.Header>
    <Accordion.Collapse eventKey={name}>
      <Card.Body>{children}</Card.Body>
    </Accordion.Collapse>
  </Card>
);
