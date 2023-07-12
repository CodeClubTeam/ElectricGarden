import React from "react";
import { CollapsibleSection } from "../../../atomic-ui";
import { DeviceAuditLog } from "../../../auditlog";
import type { DeviceInfo as Info } from "../../../shared";

type Props = {
  device: Info;
};

export const DeviceInfo = ({
  device: {
    serial,
    firmwareVersion: firmware,
    hardwareVersion: hardware,
    appSamplesEndpointOverride,
  },
}: Props) => (
  <CollapsibleSection
    name="deviceinfo"
    header={
      <>
        Firmware: {firmware}, Hardware: {hardware}
      </>
    }
  >
    <h4>Overrides</h4>
    {appSamplesEndpointOverride ? (
      <p>App Samples Endpoint Override: {appSamplesEndpointOverride}</p>
    ) : (
      <p>Using defaults.</p>
    )}
    <h4>Call Home History</h4>
    <DeviceAuditLog serial={serial} type="bootup" />
  </CollapsibleSection>
);
