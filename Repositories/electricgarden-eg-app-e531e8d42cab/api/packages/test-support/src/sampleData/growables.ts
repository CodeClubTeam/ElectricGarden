import {
  Growable,
  OrgDocument,
  SensorDocument,
  TeamDocument,
  GrowableTypeDocument,
} from '@eg/doc-db';
import faker from 'faker';
import { setupExampleGrowableType } from './growableTypes';
import { setupExampleSensor } from './sensors';
import { setupExampleTeam } from './teams';

export const exampleGrowable = (
  organisation: OrgDocument,
  team: TeamDocument,
  sensor: SensorDocument,
  type: GrowableTypeDocument,
) => ({
  _organisation: organisation,
  title: faker.lorem.word(),
  team,
  sensor,
  growableType: type,
  notes: faker.lorem.sentence(),
  soilType: faker.lorem.word(),
});

export const setupExampleGrowable = async (
  organisation: OrgDocument,
  team?: TeamDocument,
  sensor?: SensorDocument,
  type?: GrowableTypeDocument,
) => {
  const growable = new Growable(
    exampleGrowable(
      organisation,
      team ?? (await setupExampleTeam(organisation)),
      sensor ?? (await setupExampleSensor(organisation)),
      type ?? (await setupExampleGrowableType()),
    ),
  );
  await growable.save();
  return growable;
};
