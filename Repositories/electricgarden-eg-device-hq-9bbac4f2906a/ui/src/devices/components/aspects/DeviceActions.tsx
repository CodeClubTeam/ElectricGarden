import React from "react";
import { CollapsibleSection } from "../../../atomic-ui";
import { DeviceActionsEditor } from "../../../instructions";
import { DeviceInfo } from "../../../shared";

type Props = {
  device: DeviceInfo;
};

export const DeviceActions = ({ device: { serial } }: Props) => (
  <CollapsibleSection name="actions" header="Actions">
    <DeviceActionsEditor serial={serial} />
  </CollapsibleSection>
);
