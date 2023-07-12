import {
  AddressProperties,
  Growable,
  GrowableType,
  Organisation,
  OrgDocument,
  Sensor,
  Team,
  User,
  OrgMode,
} from '@eg/doc-db';
import { addTeam } from './teams';
import { addUser } from './users';

type NewOrgOptions = {
  organisation: {
    name: string;
    address: AddressProperties;
    mode?: OrgMode;
  };
  admin?: {
    name: string;
    email: string;
  };
};

export const createNewOrg = async ({
  organisation,
  admin,
}: NewOrgOptions): Promise<OrgDocument> => {
  const newOrg = new Organisation(organisation);
  await newOrg.save();

  const defaultTeam = await addTeam(newOrg, {
    name: `${newOrg.name} Default Team`,
  });

  newOrg.defaults.teamId = defaultTeam.id;

  await newOrg.save();

  if (admin) {
    await addUser(newOrg, {
      ...admin,
      role: 'admin',
      firstAdmin: true,
    });
  }

  return newOrg;
};

export const deleteOrg = async (orgId: string) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Not on production yet');
  }
  await Growable.deleteMany({ _organisation: orgId });
  await Team.deleteMany({ _organisation: orgId });
  await Sensor.deleteMany({ _organisation: orgId });
  await User.deleteMany({ _organisation: orgId });
  await Organisation.deleteOne({ _id: orgId });
};
