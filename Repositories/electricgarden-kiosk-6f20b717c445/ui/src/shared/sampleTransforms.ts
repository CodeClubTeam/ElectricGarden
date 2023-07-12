import { round } from "lodash-es";
import { SampleRaw, Sample } from "./sample";

const LUX_SATURATED = -1;
const LUX_DARK = -2;
const LUX_MINIMUM = 1;
const LUX_MAXIMUM = 64000;
function cleanLux(lux: number | null | undefined) {
  if (lux === undefined || lux === null) {
    return null;
  } else if (lux === LUX_SATURATED) {
    return LUX_MAXIMUM;
  } else if (lux === LUX_DARK || lux <= LUX_MINIMUM) {
    return LUX_MINIMUM;
  }
  return Math.round(lux);
}

const roundCreate = (precision: number) => (
  value: number | null | undefined,
) => {
  if (!value && value !== 0) {
    return null;
  }
  return round(value, precision);
};

const round1 = roundCreate(1);
const round0 = roundCreate(0);

export const cleanSample = ({
  timestamp,
  humidity,
  airTemp,
  soilMoisture,
  soilTemp,
  light,
  co2,
}: SampleRaw): Sample => {
  const cleaned: Sample = {
    timestamp: new Date(timestamp),
  };
  if (humidity !== undefined) {
    cleaned.humidity = round0(humidity);
  }
  if (airTemp !== undefined) {
    cleaned.airTemp = round1(airTemp);
  }
  if (soilMoisture !== undefined) {
    cleaned.soilMoisture = round1(soilMoisture);
  }
  if (soilTemp !== undefined) {
    cleaned.soilTemp = round1(soilTemp);
  }
  if (light !== undefined) {
    cleaned.light = cleanLux(light);
  }
  if (co2 !== undefined) {
    cleaned.co2 = co2;
  }
  return cleaned;
};
