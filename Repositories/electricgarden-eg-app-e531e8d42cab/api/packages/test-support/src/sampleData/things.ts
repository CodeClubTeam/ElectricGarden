import { Thing } from '@eg/doc-db';
import faker from 'faker';

export const exampleThing = () => ({
  serial: faker.random.alphaNumeric(6),
});

export const setupExampleThing = async () => {
  const thing = new Thing(exampleThing());
  await thing.save();
  return thing;
};
