/* eslint prefer-const: 0 */

import { Sample } from "./sample";

const round1 = (value: number) => {
  return Math.round(value * 10) / 10;
};

const round2 = (value: number) => {
  return Math.round(value * 100) / 100;
};

const parseHex = (value: string, startIndex: number, endIndex: number) => {
  let parse: number | undefined;
  parse = parseInt(value.substring(startIndex, endIndex), 16);
  if (parse === 32768) {
    return undefined;
  }
  return parse;
};

export const decodeHexSample = (
  value: string | undefined,
): Omit<Sample, "timestamp"> & { offset: number } => {
  if (!value || (value.length != 32 && value.length != 36)) {
    throw new Error("No sample or invalid sample format");
  }

  // let countVal = parseHex(value, 0, 4);
  let timeVal = parseHex(value, 4, 8);
  let light = parseHex(value, 8, 12);
  let ambientTemp = parseHex(value, 12, 16);
  let ambientHumidity = parseHex(value, 16, 20);
  let probeSoilTemp = parseHex(value, 20, 24);
  let probeMoisture = parseHex(value, 24, 28);
  let batteryVoltage = parseHex(value, 28, 32);
  let co2;
  if (value.length == 36) {
    co2 = parseHex(value, 32, 36);
  }

  if (batteryVoltage) {
    batteryVoltage = round2(batteryVoltage / 100);
  }

  if (ambientTemp && ambientTemp > 32767) {
    ambientTemp -= 65536;
  }

  if (probeSoilTemp && probeSoilTemp > 32767) {
    probeSoilTemp -= 65536;
  }

  if (ambientTemp) {
    ambientTemp = round1(ambientTemp / 10);
  }

  if (probeSoilTemp) {
    probeSoilTemp = round1(probeSoilTemp / 10);
  }

  if (ambientHumidity) {
    ambientHumidity = round1(ambientHumidity / 10);
    if (ambientHumidity > 100) {
      ambientHumidity = 100;
    }
  }

  if (probeMoisture) {
    probeMoisture = round1(probeMoisture / 10);
  }

  if (light) {
    light = round1(light);
  }

  let offset = 0;
  if (timeVal) {
    offset = timeVal;
  }

  return {
    probeAirTemp: ambientTemp, // backwards compat
    probeMoisture,
    probeSoilTemp,
    ambientTemp,
    ambientHumidity,
    batteryVoltage,
    light,
    offset,
    co2,
  };
};

// '19/11/14,13:08:29+52'
