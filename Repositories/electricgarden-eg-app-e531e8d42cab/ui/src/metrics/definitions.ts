import { ObservationValue } from '../pages/Garden/types';
import { MetricIconComponent } from './icons';
import {
    lightUnit,
    measureUnit,
    percentUnit,
    temperatureUnit,
    Unit,
} from './unitDefinitions';

export type MetricBase = {
    type: MetricType;
    label: string;
    suffix: string; // might have to be dynamic based on growable type
    color: string;
    unit: Unit;
    admin?: boolean;
};

export type MetricBaseWithIcon = MetricBase & {
    icon: MetricIconComponent;
};

export type SensorMetric = MetricBaseWithIcon & {
    source: 'sensor';
    reading: keyof Omit<DataPoint, 'timestamp'>;
};

export type ManualMetric = MetricBaseWithIcon & {
    source: 'manual';
    observationType: ObservationValue['type'];
};

export type Metric = SensorMetric | ManualMetric;

export const sensorMetricsByType: Record<
    string,
    Omit<SensorMetric, 'type' | 'icon'>
> = {
    airTemp: {
        label: 'Air Temp',
        suffix: '°C',
        color: '#00A8B5',
        unit: temperatureUnit,
        source: 'sensor',
        reading: 'probe_air_temp',
    },
    soilTemp: {
        label: 'Soil Temp',
        suffix: '°C',
        color: '#009D00',
        unit: temperatureUnit,
        source: 'sensor',
        reading: 'probe_soil_temp',
    },
    soilMoisture: {
        label: 'Soil Moisture',
        suffix: '%',
        color: '#ef7606',
        unit: percentUnit,
        source: 'sensor',
        reading: 'probe_moisture',
    },
    humidity: {
        label: 'Humidity',
        suffix: '%',
        color: '#007885',
        unit: percentUnit,
        source: 'sensor',
        reading: 'ambient_humidity',
    },
    light: {
        label: 'Light',
        suffix: 'lux',
        color: '#ec95c9',
        unit: lightUnit,
        source: 'sensor',
        reading: 'light_sensor',
    },
    rssi: {
        label: 'RSSI',
        color: '#cccccc',
        suffix: '%',
        unit: percentUnit,
        source: 'sensor',
        reading: 'rssi',
        admin: true,
    },
    battery: {
        label: 'Battery',
        color: 'green',
        suffix: 'volts',
        unit: percentUnit,
        source: 'sensor',
        reading: 'batteryPercent',
        admin: true,
    },
};

export const manualMetricsByType: Record<
    string,
    Omit<ManualMetric, 'type' | 'icon'>
> = {
    plantMeasure: {
        label: 'Plant Size',
        suffix: 'cm',
        color: '#2ed03c', // tmp
        source: 'manual',
        observationType: 'plantMeasure',
        unit: measureUnit,
    },
    produceMeasure: {
        label: 'Produce Size',
        suffix: 'cm',
        color: '#2ed03c', // tmp
        source: 'manual',
        observationType: 'produceMeasure',
        unit: measureUnit,
    },
    // yield: {}, dynamic unit and suffix and maybe even icon
};

export type MetricType = keyof typeof sensorMetricsByType &
    keyof typeof manualMetricsByType;

export type VisibleMetricTypes = Record<MetricType, boolean | undefined>;
