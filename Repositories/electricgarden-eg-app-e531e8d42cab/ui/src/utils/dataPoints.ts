import { round } from 'lodash-es';

export const cleanDataPoint = ({
    timestamp,
    readings,
}: ServerDataPoint): DataPoint => ({
    timestamp: new Date(timestamp),
    ambient_humidity: round0(readings.ambient_humidity),
    probe_air_temp: round1(readings.probe_air_temp),
    probe_moisture: round1(readings.probe_moisture),
    probe_soil_temp: round1(readings.probe_soil_temp),
    battery_voltage: readings.battery_voltage ?? null,
    light_sensor: cleanLux(readings.light_sensor),
    snr: readings.snr ?? null,
    rssi: rssiToPercentage(readings.rssi),
    batteryPercent: getBatteryChargePercent(readings),
    co2: readings.co2 ?? null,
});

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

export function rssiToPercentage(rssi?: number) {
    if (rssi === undefined || rssi === null) {
        return null;
    }
    /*
G01:
  best = -51
  worst = -113

L01: (observed)
  best = -52
  worst = -120
*/
    return (rssi + 120) * (100 / 68);
}

const BATTERY_MAX_VOLTAGE = 4.8;
const BATTERY_MIN_VOLTAGE = 3.5;

export const getBatteryChargePercent = ({
    battery_voltage,
}: ServerDataPoint['readings']) => {
    if (!battery_voltage) {
        return 0;
    }
    if (battery_voltage < BATTERY_MIN_VOLTAGE) {
        return 0;
    }
    if (battery_voltage > BATTERY_MAX_VOLTAGE) {
        return 100;
    }

    // Multiply by 10 instead of 100 before the round and then by 10 after to only return increments of 10% values.
    // prettier-ignore
    return Math.round(((battery_voltage - BATTERY_MIN_VOLTAGE) / (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE)) * 10) * 10;
};
