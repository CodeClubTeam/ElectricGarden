import React from "react";
import { CollapsibleSection } from "../../../atomic-ui";
import { DeviceAuditLog } from "../../../auditlog";
import { DeviceInfo } from "../../../shared";

type Props = {
  device: DeviceInfo;
};

export const DeviceAudit = ({ device: { serial } }: Props) => (
  <CollapsibleSection name="auditlog" header="Audit Log">
    <DeviceAuditLog serial={serial} />
  </CollapsibleSection>
);
