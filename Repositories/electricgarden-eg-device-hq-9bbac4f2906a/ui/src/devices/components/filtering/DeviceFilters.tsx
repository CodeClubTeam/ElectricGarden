import React from "react";
import styled from "styled-components/macro";
import { DeviceSerialFilter } from "./DeviceSerialFilter";

import { DeviceStatusFilter } from "./DeviceStatusFilter";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  serial: string | null | undefined;
  onSerialChange: (serial: string | undefined | null) => void;
  serials: string[];
};

export const DeviceFilters = ({ serial, onSerialChange, serials }: Props) => {
  return (
    <Container>
      <DeviceStatusFilter />
      <DeviceSerialFilter
        serial={serial}
        onSerialChange={onSerialChange}
        serials={serials}
      />
    </Container>
  );
};
