import { Organisation, OrgProperties } from '@eg/doc-db';
import faker from 'faker';
import { exampleAddress } from './address';

export const exampleOrganisation = (): OrgProperties => ({
  name: faker.company.companyName(),
  address: exampleAddress(),
  defaults: {},
  _created: new Date(),
});

export const setupExampleOrg = async () => {
  const organisation = new Organisation(exampleOrganisation());
  await organisation.save();
  return organisation;
};
