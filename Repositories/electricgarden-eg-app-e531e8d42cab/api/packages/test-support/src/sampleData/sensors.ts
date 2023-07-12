import { OrgDocument, Sensor, ThingDocument } from '@eg/doc-db';
import faker from 'faker';

export const exampleSensor = (org?: OrgDocument, thing?: ThingDocument) => ({
  _organisation: org?._id,
  name: faker.name.firstName(),
  serial: thing?.serial ?? faker.random.word(),
});

export const setupExampleSensor = async (
  org: OrgDocument,
  thing?: ThingDocument,
) => {
  const sensor = new Sensor(exampleSensor(org, thing));
  await sensor.save();
  return sensor;
};
