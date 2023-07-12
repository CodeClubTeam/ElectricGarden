/* eslint-disable camelcase */
import { Sample } from './types';
import { Point, PointDocument } from '@eg/doc-db';

const dateToTimestampSeconds = (ts: Date) => Math.floor(ts.getTime() / 1000);

// don't ask me why strings in db for numbers
const stringify = (value?: number) => value?.toString();

const mapToReadings = (s: Sample): PointDocument['readings'] => ({
  probe_soil_temp: stringify(s.probeSoilTemp),
  probe_air_temp: stringify(s.probeAirTemp),
  battery_voltage: stringify(s.batteryVoltage),
  ambient_temperature: stringify(s.ambientTemp),
  probe_moisture: stringify(s.probeMoisture),
  rssi: stringify(s.rssi),
  snr: stringify(s.snr),
  ambient_humidity: stringify(s.ambientHumidity),
  co2: stringify(s.co2),
  light_sensor: stringify(s.light),
  error_code: stringify(s.errorCode),
});

export const mapSampleToPoint = (serial: string, sample: Sample) =>
  new Point({
    nodeSerial: serial,
    gatewaySerial: 'DHQ',
    timestampSeconds: dateToTimestampSeconds(sample.timestamp).toString(),
    readings: mapToReadings(sample),
  });
