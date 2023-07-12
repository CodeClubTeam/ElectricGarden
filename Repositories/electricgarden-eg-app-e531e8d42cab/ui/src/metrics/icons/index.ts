import React from 'react';

import { AirTempIcon } from './AirTempIcon';
import { HumidityIcon } from './HumidityIcon';
import { LightIcon } from './LightIcon';
import { MoistureIcon } from './MoistureIcon';
import { SoilTempIcon } from './SoilTempIcon';
import { MetricType } from '../definitions';

export type MetricIconComponent = React.ComponentType<
    React.SVGProps<SVGSVGElement>
>;

const iconsByMetricType: Record<MetricType, MetricIconComponent> = {
    airTemp: AirTempIcon,
    soilTemp: SoilTempIcon,
    light: LightIcon,
    soilMoisture: MoistureIcon,
    humidity: HumidityIcon,
};

export const getMetricIcon = (type: MetricType): MetricIconComponent => {
    const icon = iconsByMetricType[type];
    // if (!icon) {
    //     throw new Error(`No icon found for metric: ${type}.`);
    // }
    return icon;
};
