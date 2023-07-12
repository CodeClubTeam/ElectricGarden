import React from "react";
import Badge from "react-bootstrap/esm/Badge";
import { Link, useRouteMatch } from "react-router-dom";
import styled from "styled-components/macro";
import { useSelectedStatusFilters } from "./useSelectedStatusFilters";

const Container = styled.div`
  padding: 0.25em;
  margin-left: auto;
  display: flex;
  justify-content: center;
  a {
    margin: 0.1em;
    text-transform: lowercase;
  }
`;

export const DeviceStatusFilter = () => {
  const { status } = useSelectedStatusFilters();
  const { url } = useRouteMatch();
  return (
    <Container>
      <Badge variant={!status ? "primary" : "dark"} as={Link} to={`${url}`}>
        All
      </Badge>
      <Badge
        variant={status === "active" ? "primary" : "dark"}
        as={Link}
        to={`${url}?status=active`}
      >
        Active
      </Badge>
      <Badge
        variant={status === "inactive" ? "primary" : "dark"}
        as={Link}
        to={`${url}?status=inactive`}
      >
        Inactive
      </Badge>
    </Container>
  );
};
