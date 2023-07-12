import React from "react";
import type { SelectCallback } from "react-bootstrap/esm/helpers";
import Tab from "react-bootstrap/esm/Tab";
import Tabs from "react-bootstrap/esm/Tabs";
import { useHistory, useParams } from "react-router-dom";
import { DeviceType } from "../../shared";
import { DefaultDeviceSettingsEditor } from "./DefaultDeviceSettingsEditor";
import { SampleRelaySettingsEditor } from "../../sample-relay-settings";

export const DeviceTypeDefaults = () => {
  const { type } = useParams<{ type: DeviceType }>();
  const history = useHistory();

  const handleSelect: SelectCallback = (newType) => {
    history.push(`./${newType}`);
  };
  return (
    <div>
      <Tabs activeKey={type} onSelect={handleSelect} id="device-type-tabs">
        <Tab eventKey="lora" title="LoRa">
          <DefaultDeviceSettingsEditor type="lora" />
        </Tab>
        <Tab eventKey="catm1" title="Catm1">
          <DefaultDeviceSettingsEditor type="catm1" />
        </Tab>
        <Tab eventKey="samplerelay" title="Sample Relay">
          <SampleRelaySettingsEditor />
        </Tab>
      </Tabs>
    </div>
  );
};
