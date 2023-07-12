import { Learner, OrgDocument, User, userConfig } from '@eg/doc-db';
import faker from 'faker';

export const exampleUserProps = () => ({
  name: faker.name.firstName(),
  email: faker.internet.email(),
  status:
    userConfig.statuses[faker.random.number(userConfig.statuses.length - 1)],
  role: userConfig.roles[faker.random.number(userConfig.roles.length - 1)],
  learnerLevel: faker.random.number(20) + 1,
});

export const exampleUser = (org: OrgDocument) => ({
  _organisation: org,
  ...exampleUserProps(),
});

export const setupExampleUser = async (org: OrgDocument) => {
  const { learnerLevel, ...props } = exampleUserProps();
  const user = new User({ ...props, _organisation: org });
  user.learner = new Learner({ level: learnerLevel });
  await user.save();
  return user;
};
