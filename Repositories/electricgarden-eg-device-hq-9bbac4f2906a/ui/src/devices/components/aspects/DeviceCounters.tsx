import React from "react";

import { CollapsibleSection } from "../../../atomic-ui";
import { CountersTable } from "../../../counters";
import { DeviceInfo } from "../../../shared";

type Props = {
  device: DeviceInfo;
};

export const DeviceCounters = ({ device: { serial } }: Props) => (
  <CollapsibleSection name="counters" header="Counters">
    <CountersTable serial={serial} />
  </CollapsibleSection>
);
