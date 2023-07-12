import React from "react";
import { CollapsibleSection } from "../../../atomic-ui";
import { SampleRelaySettingsEditor } from "../../../sample-relay-settings";
import type { DeviceInfo } from "../../../shared";

type Props = {
  device: DeviceInfo;
};

export const DeviceSampleRelaySettings = ({ device: { serial } }: Props) => (
  <CollapsibleSection name="sampleRelaySettings" header="Sample Relay Settings">
    <SampleRelaySettingsEditor serial={serial} />
  </CollapsibleSection>
);
