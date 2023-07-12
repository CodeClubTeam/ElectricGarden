import React from "react";
import { DeviceStatusAggregate } from "./DeviceStatusAggregate";
import ListGroup from "react-bootstrap/esm/ListGroup";
import { DeviceStatus } from "../../shared";
import { Link } from "react-router-dom";

const Item: React.FC<{ status: DeviceStatus }> = ({ status, children }) => (
  <ListGroup.Item
    as={Link}
    to={`./devices?status=${encodeURIComponent(status ?? "")}`}
  >
    {children}
  </ListGroup.Item>
);

export const DeviceStatusAggregates = () => {
  return (
    <ListGroup>
      <Item status="active">
        <DeviceStatusAggregate status="active">Active</DeviceStatusAggregate>
      </Item>
      <Item status="inactive">
        <DeviceStatusAggregate status="inactive">
          Inactive
        </DeviceStatusAggregate>
      </Item>
    </ListGroup>
  );
};
