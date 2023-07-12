import faker from 'faker';
import {
  OrgDocument,
  Team,
  TeamMembershipDocument,
  TeamMembership,
} from '@eg/doc-db';

export const exampleTeam = (org: OrgDocument) => ({
  _organisation: org,
  name: faker.name.firstName(),
  memberships: [],
});

export const setupExampleTeam = async (
  org: OrgDocument,
  memberUserIds: TeamMembershipDocument['userId'][] = [],
) => {
  const team = new Team(exampleTeam(org));
  for (const userId of memberUserIds) {
    team.addMembership(new TeamMembership({ userId, role: 'member' }));
  }
  await team.save();
  return team;
};
