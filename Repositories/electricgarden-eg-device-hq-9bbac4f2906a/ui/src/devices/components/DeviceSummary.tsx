import moment from "moment";
import React from "react";
import styled from "styled-components/macro";

import { DeviceTypeIcon } from "./DeviceTypeIcon";

const Header = styled.h3`
  font-size: 1.1rem;
  max-width: var(--device-nav-width);
  margin: 0;
`;

const Detail = styled.p`
  font-size: 0.8rem;
  max-width: var(--device-nav-width);
  margin: 0;
`;

const LastReceived = styled.span`
  font-size: 0.8em;
  padding-left: 0.2em;
`;

type Props = {
  serial: string;
  type: "catm1" | "lora";
  lastReceived?: Date;
};

export const DeviceSummary = ({ serial, type, lastReceived }: Props) => (
  <>
    <Header>{serial}</Header>
    <Detail>
      <DeviceTypeIcon {...{ type, lastReceived }} />
      <LastReceived>
        {lastReceived ? moment(lastReceived).fromNow() : "never"}
      </LastReceived>
    </Detail>
  </>
);
