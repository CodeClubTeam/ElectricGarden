import {
  Growable,
  GrowableType,
  Learner,
  Lesson,
  mongoose,
  Organisation,
  Team,
  User,
} from '@eg/doc-db';

import {
  DEFAULT_ORG_NAME,
  setupTestTenant,
  testUserEmails,
  exampleOrganisation,
} from './sampleData';

export const disconnectDb = () => mongoose.connection.close();

export const initDb = async () => {
  // this is pretty stupid.
  // really want to have a standard initial state with just a tenant in a known state
  // otherwise empty database at the start of every test (beforeEach)
  await setupTestTenant();
  await Promise.all([
    Lesson.deleteMany({}),
    Learner.deleteMany({}),
    Growable.deleteMany({}),
    Team.deleteMany({}),
    User.deleteMany({ email: { $nin: testUserEmails } }),
    Organisation.deleteMany({ name: { $ne: DEFAULT_ORG_NAME } }),
  ]);

  // default org doesn't get cleared so we need to reset it
  const defaultOrg = await Organisation.findOneByName(DEFAULT_ORG_NAME);
  if (defaultOrg) {
    const initialOrg = exampleOrganisation();
    defaultOrg.mode = initialOrg.mode;
    await defaultOrg.save();
  }

  const otherGrowableType = await GrowableType.findOneByName('other');
  if (!otherGrowableType) {
    await new GrowableType({ name: 'other', title: 'Other' }).save();
  }
};
