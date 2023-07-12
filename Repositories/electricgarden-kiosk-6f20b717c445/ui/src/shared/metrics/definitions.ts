import { MetricIconComponent } from "./icons";
import {
  lightUnit,
  percentUnit,
  ppmUnit,
  temperatureUnit,
  Unit,
} from "./unitDefinitions";
import { Sample } from "../sample";

export interface Metric {
  type: string;
  label: string;
  suffix: string; // might have to be dynamic based on growable type
  color: string;
  unit: Unit;
  icon: MetricIconComponent;
  reading: keyof Omit<Sample, "timestamp">;
}

export const sensorMetricsByType: Record<
  string,
  Omit<Metric, "type" | "icon">
> = {
  airTemp: {
    label: "Air Temp",
    suffix: "°C",
    color: "#00A8B5",
    unit: temperatureUnit,
    reading: "airTemp",
  },
  soilTemp: {
    label: "Soil Temp",
    suffix: "°C",
    color: "#009D00",
    unit: temperatureUnit,
    reading: "soilTemp",
  },
  soilMoisture: {
    label: "Soil Moisture",
    suffix: "%",
    color: "#ef7606",
    unit: percentUnit,
    reading: "soilMoisture",
  },
  humidity: {
    label: "Humidity",
    suffix: "%",
    color: "#007885",
    unit: percentUnit,
    reading: "humidity",
  },
  light: {
    label: "Light",
    suffix: "lux",
    color: "#ec95c9",
    unit: lightUnit,
    reading: "light",
  },
  co2: {
    label: "CO2",
    suffix: "ppm",
    color: "#999999",
    unit: ppmUnit,
    reading: "co2",
  },
};

export type MetricType = keyof typeof sensorMetricsByType;

export type VisibleMetricTypes = Record<MetricType, boolean | undefined>;
