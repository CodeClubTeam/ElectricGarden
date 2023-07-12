import { orderBy } from "lodash-es";
import React, { useMemo, useState } from "react";
import ListGroup from "react-bootstrap/esm/ListGroup";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import styled from "styled-components/macro";

import { FetchError, Loading } from "../../atomic-ui";
import { useFetchDevicesFiltered, useUrlCriteria } from "../../shared";
import { DeviceSummary } from "./DeviceSummary";
import { DeviceFilters } from "./filtering/DeviceFilters";

const Container = styled.div``;

const StyledListGroup = styled(ListGroup)``;

const StyledListGroupItem = styled(ListGroup.Item)`
  cursor: pointer;
  padding: 0.5rem 1rem;
`;

export const DeviceList = () => {
  const { url, params } = useRouteMatch<{ serial: string }>();
  const [serialFilter, setSerialFilter] = useState<string>();
  const history = useHistory();
  const location = useLocation();
  const criteria = useUrlCriteria();
  const {
    isFetching,
    isError,
    refetch,
    data: devices,
  } = useFetchDevicesFiltered(criteria);

  const sortedDevices = useMemo(
    () =>
      orderBy(
        devices?.filter((d) => !!d.lastReceived),
        "lastReceived",
        "desc",
      ).concat(devices ? devices.filter((d) => !d.lastReceived) : []),
    [devices],
  );

  const handleNavToDevice = (serial: string) => {
    const basePath = params.serial ? "/devices" : url; // react router can be so painful. hard coding ftw

    history.push(`${basePath}/${serial}${location.search}`);
    window.scrollTo(0, 0);
  };

  const handleSerialFilterChange = (serial: string | undefined | null) => {
    if (serial && devices?.find((d) => d.serial === serial)) {
      handleNavToDevice(serial);
    } else {
      setSerialFilter(serial ?? undefined);
    }
  };

  if (isFetching) {
    return <Loading />;
  }

  if (isError || !devices) {
    return <FetchError message="Error fetching devices" retry={refetch} />;
  }

  const serials = devices.map((d) => d.serial);

  return (
    <Container>
      <DeviceFilters
        serials={serials}
        serial={serialFilter}
        onSerialChange={handleSerialFilterChange}
      />
      <StyledListGroup>
        {sortedDevices.map(({ serial, type, lastReceived }) => (
          <StyledListGroupItem
            key={serial}
            onClick={() => handleNavToDevice(serial)}
            active={serial === params.serial}
          >
            <DeviceSummary
              {...{
                serial,
                type,
                lastReceived,
              }}
            />
          </StyledListGroupItem>
        ))}
      </StyledListGroup>
    </Container>
  );
};
