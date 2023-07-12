import {
  faSignal,
  faWifi,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import moment from "moment";
import React from "react";
import styled from "styled-components/macro";

type Props = {
  type: "catm1" | "lora";
  lastReceived?: Date;
};

const iconsByType: Record<Props["type"], IconDefinition> = {
  catm1: faSignal,
  lora: faWifi,
};

type StyledFaIconProps = FontAwesomeIconProps & Pick<Props, "lastReceived">;

const StyledFaIcon = styled(({ lastReceived, ...props }: StyledFaIconProps) => (
  <FontAwesomeIcon {...props} />
))`
  color: ${({ lastReceived }) => {
    const daysSince = lastReceived ? moment().diff(lastReceived, "days") : 99;
    if (daysSince < 1) {
      return "green";
    }
    if (daysSince <= 2) {
      return "orange";
    }
    return "red";
  }};
`;

export const DeviceTypeIcon = ({ type, lastReceived }: Props) => (
  <StyledFaIcon icon={iconsByType[type]} lastReceived={lastReceived} />
);
