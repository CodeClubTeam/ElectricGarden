import React, { useMemo } from "react";
import Badge from "react-bootstrap/esm/Badge";
import { FetchError, Loading } from "../../atomic-ui";
import {
  DeviceStatus,
  deviceStatusToCriteria,
  useFetchDevicesFiltered,
} from "../../shared";

type Props = {
  status: DeviceStatus;
  children: React.ReactNode;
};

export const DeviceStatusAggregate = ({ children, status }: Props) => {
  const criteria = useMemo(() => deviceStatusToCriteria(status), [status]);
  const {
    isFetching,
    isError,
    refetch,
    data: devices,
  } = useFetchDevicesFiltered(criteria);
  if (isFetching) {
    return <Loading />;
  }

  if (isError || !devices) {
    return <FetchError message="Error fetching devices" retry={refetch} />;
  }

  return (
    <>
      {children}
      <Badge variant="secondary" pill className="float-right">
        {devices.length}
      </Badge>
    </>
  );
};
