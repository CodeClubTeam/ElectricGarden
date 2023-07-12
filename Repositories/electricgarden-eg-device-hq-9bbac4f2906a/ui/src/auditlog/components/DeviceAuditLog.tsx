import moment from "moment";
import React from "react";
import Table from "react-bootstrap/esm/Table";
import { FetchError, Loading } from "../../atomic-ui";
import { useFetchDeviceAuditLog } from "./auditLogApi";

type Props = {
  serial: string;
  type?: string;
};

export const DeviceAuditLog = ({ serial, type }: Props) => {
  const { isFetching, isError, refetch, data: logs } = useFetchDeviceAuditLog(
    serial,
    {
      type,
    },
  );
  if (isFetching) {
    return <Loading />;
  }

  if (isError || !logs) {
    return <FetchError message="Error fetching audit logs" retry={refetch} />;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Occurred</th>
          <th>Content</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={index}>
            <td>{log.type}</td>
            <td title={moment(log.createdOn).format("llll")}>
              {moment(log.createdOn).fromNow()}
            </td>
            <td>
              {log.content ? <pre>{JSON.stringify(log.content)}</pre> : "None"}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
