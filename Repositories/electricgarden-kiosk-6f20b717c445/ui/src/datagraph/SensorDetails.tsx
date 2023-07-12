import React from "react";
import styled from "styled-components/macro";
import { Sensor } from "./state";

const Header = styled.h1`
  font-size: 1.25rem;
  margin: 0.2em;
`;

type Props = Sensor;

export const SensorDetails = ({ serial, title }: Props) => (
  <Header title={serial}>{title}</Header>
);
