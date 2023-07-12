import React from "react";
import { DeviceStatusAggregates } from "./DevicesStatusAggregates";

export const DashboardPage = () => (
  <div>
    <h3>Dashboard</h3>

    <h4>Devices By Status</h4>
    <DeviceStatusAggregates />
  </div>
);
