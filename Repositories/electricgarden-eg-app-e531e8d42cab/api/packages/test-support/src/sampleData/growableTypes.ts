import { GrowableType } from '@eg/doc-db';
import faker from 'faker';

export const exampleGrowableType = () => ({
  name: faker.lorem.word(),
  title: faker.lorem.sentence(),
  // observables: ['photographed', 'planted', faker.lorem.word()],
});

export const setupExampleGrowableType = async () => {
  const details = exampleGrowableType();
  const growableType = new GrowableType(details);
  await growableType.save();
  return growableType;
};
