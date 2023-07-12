import { AddressProperties } from '@eg/doc-db';
import faker from 'faker';

export const exampleAddress = (): AddressProperties => ({
  line1: faker.address.streetAddress(),
  line2: '',
  line3: faker.address.secondaryAddress(),
  postcode: faker.address.zipCode('0000'),
  city: faker.address.city(),
  country: 'New Zealand',
});
