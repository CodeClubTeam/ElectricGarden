import React from "react";

import { MetricType } from "../definitions";
import { AirTempIcon } from "./AirTempIcon";
import { Co2Icon } from "./Co2Icon";
import { HumidityIcon } from "./HumidityIcon";
import { LightIcon } from "./LightIcon";
import { MoistureIcon } from "./MoistureIcon";
import { SoilTempIcon } from "./SoilTempIcon";

export type MetricIconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement>
>;

const iconsByMetricType: Record<MetricType, MetricIconComponent> = {
  airTemp: AirTempIcon,
  soilTemp: SoilTempIcon,
  light: LightIcon,
  soilMoisture: MoistureIcon,
  humidity: HumidityIcon,
  co2: Co2Icon,
};

export const getMetricIcon = (type: MetricType): MetricIconComponent => {
  const icon = iconsByMetricType[type];
  if (!icon) {
    throw new Error(`No icon found for metric: ${type}.`);
  }
  return icon;
};
