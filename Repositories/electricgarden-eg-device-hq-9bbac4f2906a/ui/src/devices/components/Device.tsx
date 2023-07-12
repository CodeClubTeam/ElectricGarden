import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import React from "react";
import Accordion from "react-bootstrap/esm/Accordion";
import { useParams } from "react-router-dom";
import styled from "styled-components/macro";

import { FetchError, Loading } from "../../atomic-ui";
import { useFetchDevices } from "../../shared";
import { DeviceActions } from "./aspects/DeviceActions";
import { DeviceAudit } from "./aspects/DeviceAudit";
import { DeviceCounters } from "./aspects/DeviceCounters";
import { DeviceInfo } from "./aspects/DeviceInfo";
import { DeviceSampleRelaySettings } from "./aspects/DeviceSampleRelaySettings";
import { DeviceSettings } from "./aspects/DeviceSettings";
import { DeviceTypeIcon } from "./DeviceTypeIcon";

const Container = styled.div`
  margin: 10px;
`;

const Header = styled.div`
  display: flex;
`;

const Heading = styled.h3`
  text-align: center;
  flex: 2;
`;

const AppLink = styled.a`
  font-size: 1rem;
  text-transform: lowercase;
`;

const Footer = styled.footer`
  margin: 10px;
`;

const FooterItem = styled.p`
  font-size: 0.9rem;
  margin: 0;
  text-align: right;
`;

const getAppUrl = (serial: string) =>
  `https://app.electricgarden.nz/admin/support/hardware/${serial}/`;

export const Device = () => {
  const { serial } = useParams<{ serial: string }>();

  let { isFetching, isError, refetch, data: devices } = useFetchDevices();
  if (isFetching) {
    return <Loading />;
  }

  if (isError || !devices) {
    return <FetchError message="Error fetching devices" retry={refetch} />;
  }

  const device = devices.find((d) => d.serial === serial);
  if (!device) {
    return (
      <FetchError
        message={`Device not found with serial: ${serial}`}
        retry={refetch}
      />
    );
  }

  return (
    <Container>
      <Header>
        <Heading>
          <DeviceTypeIcon
            type={device.type}
            lastReceived={device.lastReceived}
          />{" "}
          {serial}
        </Heading>
        <AppLink
          href={getAppUrl(serial)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} /> App Data
        </AppLink>
      </Header>
      <Accordion>
        <DeviceInfo device={device} />
        <DeviceAudit device={device} />
        <DeviceSettings device={device} />
        <DeviceSampleRelaySettings device={device} />
        <DeviceCounters device={device} />
        {device.type === "catm1" && <DeviceActions device={device} />}
      </Accordion>
      <Footer>
        <FooterItem>
          Last updated {moment(device.updatedOn).fromNow()}
        </FooterItem>
        <FooterItem>
          Last sample received{" "}
          {device.lastReceived
            ? moment(device.lastReceived).fromNow()
            : "never"}
        </FooterItem>
      </Footer>
    </Container>
  );
};
