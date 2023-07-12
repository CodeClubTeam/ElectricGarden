import React from "react";
import { CollapsibleSection } from "../../../atomic-ui";
import { DeviceSettingsEditor } from "../../../instructions";
import type { DeviceInfo } from "../../../shared";

type Props = {
  device: DeviceInfo;
};

export const DeviceSettings = ({ device: { serial } }: Props) => (
  <CollapsibleSection name="deviceSettings" header="Settings">
    <DeviceSettingsEditor serial={serial} />
  </CollapsibleSection>
);
