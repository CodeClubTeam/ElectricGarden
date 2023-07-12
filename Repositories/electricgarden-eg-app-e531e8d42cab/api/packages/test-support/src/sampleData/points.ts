/* eslint-disable camelcase */
import faker from 'faker';
import { range } from 'lodash';
import { PointDocument, Point } from '@eg/doc-db';

export const examplePoint = (serial: string) => {
  const timestampSeconds = faker.date.recent().getMilliseconds() / 1000;
  return {
    nodeSerial: serial,
    gatewaySerial: 'L01',
    timestampSeconds: timestampSeconds.toString(),
    readings: {
      ambient_humidity: faker.random.number(100).toString(),
      ambient_temperature: faker.random.number(35).toString(),
      battery_voltage: faker.random.number(2.5).toString(),
      light_sensor: faker.random.number().toString(),
      probe_air_temp: faker.random.number(35).toString(),
      probe_moisture: faker.random.number(100).toString(),
      probe_soil_temp: faker.random.number(35).toString(),
    },
  };
};

export const examplePoints = (serial: string, count: number) =>
  range(1, count).map(() => examplePoint(serial));

export const setupExamplePoint = async (serial: string) => {
  const point = new Point(examplePoint(serial));
  await point.save();
  return point;
};

export const setupExamplePoints = async (serial: string, count: number) => {
  const points: PointDocument[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of range(1, count)) {
    points.push(await setupExamplePoint(serial));
  }
  return points;
};
