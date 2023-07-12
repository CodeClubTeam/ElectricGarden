import {
  Learner,
  mongoose,
  Organisation,
  User,
  UserDocument,
} from '@eg/doc-db';
import { exampleOrganisation } from './organisations';

interface TestUser {
  name: string;
  email: string;
  password: string;
  role: UserDocument['role'];
  learner: {
    level: number;
  };
}

// these users are set up in auth0 on dev acct as database users
export const testUsers: Record<string, TestUser> = {
  mrhappy: {
    name: 'Mr Happy',
    email: 'alan+mrhappy@electricgarden.nz',
    password: 'WEf094rfaw*',
    role: 'member',
    learner: {
      level: 2,
    },
  },
  mrtickle: {
    name: 'Mr Tickle',
    email: 'alan+mrtickle@electricgarden.nz',
    password: 'WEf094rfaw*',
    role: 'admin',
    learner: {
      level: 99,
    },
  },
} as const;

export type TestUserName = keyof typeof testUsers;

export const defaultUser: TestUserName = 'mrhappy';

export const testUserEmails = Object.values(testUsers).map(
  (user) => user.email,
);

export const setupTestUsers = (organisationId: string) =>
  Promise.all(
    Object.values(testUsers)
      .map(({ name, email, role, learner }) => ({
        _organisation: mongoose.Types.ObjectId.createFromHexString(
          organisationId,
        ),
        name,
        email,
        role,
        learner: learner ? new Learner(learner) : undefined,
        status: 'active' as const,
      }))
      .map((value) =>
        User.findOneAndUpdate({ email: value.email }, value, { upsert: true }),
      ),
  );

export const DEFAULT_ORG_NAME = 'Lilliput';

export const setupTestOrg = async ({
  separate: add,
}: { separate?: boolean } = {}) => {
  if (!add) {
    const existing = await Organisation.findOneByName(DEFAULT_ORG_NAME);
    if (existing) {
      return existing;
    }
  }
  const values = exampleOrganisation();
  if (!add) {
    values.name = DEFAULT_ORG_NAME;
  }

  const organisation = await Organisation.findOneAndUpdate(
    { name: values.name },
    values as any, // mongoose types too tight now
    {
      upsert: true,
      new: true,
    },
  );
  if (!organisation) {
    throw new Error('Failed to upsert test org');
  }
  return organisation;
};

export const setupTestTenant = async () => {
  const organisation = await setupTestOrg();
  const users = await setupTestUsers(organisation.id);
  return {
    organisation,
    users: users.filter((user): user is UserDocument => !!user),
  };
};
