import { restoreLux } from "./valueTransforms";

export type UnitDefinition = {
  type: string;
  suffix: string;
  valueTransform?: (value: number) => number;
  axis: {
    label: string;
    tickFormat?: (tick: any, index: number, ticks: any[]) => React.ReactText;
  };
};

export const temperatureUnit: UnitDefinition = {
  type: "celcius",
  suffix: "°C",
  axis: {
    label: "Degrees Celsius (°C)",
  },
};

export type TemperatureUnit = typeof temperatureUnit;

export const lightUnit: UnitDefinition = {
  type: "lux",
  suffix: "Lux",
  valueTransform: restoreLux,
  axis: {
    label: "Lux",
    tickFormat: (value) => `${(restoreLux(value) || 1).toExponential(0)}`,
  },
};

export type LightUnit = typeof lightUnit;

export const percentUnit: UnitDefinition = {
  type: "percent",
  suffix: "%",
  axis: {
    label: "Percent",
  },
};

export type PercentUnit = typeof percentUnit;

export const measureUnit: UnitDefinition = {
  type: "measure",
  suffix: "cm",
  axis: {
    label: "cm",
  },
};

export type MeasureUnit = typeof measureUnit;

export const ppmUnit: UnitDefinition = {
  type: "ppm",
  suffix: "ppm",
  axis: {
    label: "ppm",
  },
};

export type PpmUnit = typeof ppmUnit;

export type Unit =
  | TemperatureUnit
  | LightUnit
  | PercentUnit
  | MeasureUnit
  | PpmUnit;

export type UnitType = Unit["type"];
