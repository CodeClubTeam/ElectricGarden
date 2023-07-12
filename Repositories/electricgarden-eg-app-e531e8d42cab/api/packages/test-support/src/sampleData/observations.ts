import {
  GrowableDocument,
  Observation,
  ObservationValue,
  UserDocument,
} from '@eg/doc-db';
import faker from 'faker';

type CreateDefinition = {
  growable: GrowableDocument;
  recordedBy: UserDocument;
  value?: ObservationValue;
};

export const exampleObservationValue = (): ObservationValue => ({
  type: 'photographed',
  data: {
    assetId: faker.random.uuid(),
  },
});

export const exampleObservation = ({
  growable,
  recordedBy,
  value,
}: CreateDefinition) => ({
  growable,
  value: value || exampleObservationValue(),
  recordedBy,
  recordedOn: faker.date.past(),
  occurredOn: faker.date.past(),
  comments: faker.lorem.sentence(),
});

export const setupExampleObservation = async (
  createDefinition: CreateDefinition,
) => {
  const observation = new Observation(exampleObservation(createDefinition));
  await observation.save();
  return observation;
};
