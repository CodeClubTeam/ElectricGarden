// To fit this logarithmic value in a comparable way with the other values
const LUX_MAGIC_CONSTANT = 10;

export const transformLux = (lux: number) =>
  Math.round(Math.log10(lux) * LUX_MAGIC_CONSTANT);

const MOISTURE_MAGIC_CONSTANT = 1;
export function transformMoisture(soilMoisture: number) {
  return soilMoisture * MOISTURE_MAGIC_CONSTANT;
}

export function restoreLux(lux: number) {
  return Math.pow(10, lux / LUX_MAGIC_CONSTANT);
}
