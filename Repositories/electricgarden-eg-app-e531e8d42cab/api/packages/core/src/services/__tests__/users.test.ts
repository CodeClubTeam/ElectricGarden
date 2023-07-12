import {
  OrgDocument,
  Team,
  TeamMembershipDocument,
  User,
  UserDocument,
} from '@eg/doc-db';
import {
  disconnectDb,
  exampleOrganisation,
  exampleUser,
  initDb,
} from '@eg/test-support';

import { createNewOrg } from '../organisations';
import { addUser } from '../users';

describe('users', () => {
  let organisation: OrgDocument;

  beforeEach(async () => {
    await initDb();
    organisation = await createNewOrg({ organisation: exampleOrganisation() });
  });

  afterAll(disconnectDb);

  describe('addUser', () => {
    let user: UserDocument;

    const getDefaultTeamMembership = async () => {
      const defaultTeam = await Team.findById(organisation.defaults.teamId);
      return defaultTeam?.memberships.find((e) => e.userId.equals(user.id));
    };

    describe('no default team', () => {
      beforeEach(async () => {
        organisation.defaults.teamId = undefined;
        await organisation.save();

        user = await addUser(organisation, exampleUser(organisation));
      });

      it('user should be created in db', async () => {
        const userEmail = user.email;
        expect(await User.findOneByEmail(userEmail)).toBeDefined();
      });

      it('user should NOT be member of what is no longer default team', async () => {
        expect(await getDefaultTeamMembership()).toBeUndefined();
      });
    });

    describe('default team on org', () => {
      let membership: TeamMembershipDocument | undefined;

      describe('user with member role', () => {
        beforeEach(async () => {
          user = await addUser(organisation, {
            ...exampleUser(organisation),
            role: 'member',
          });
          membership = await getDefaultTeamMembership();
        });

        it('user should be member of default team', async () => {
          expect(membership).toBeDefined();
        });

        it('user membership should be in member role', async () => {
          expect(membership?.role).toBe('member');
        });
      });

      describe('user with leader role', () => {
        beforeEach(async () => {
          user = await addUser(organisation, {
            ...exampleUser(organisation),
            role: 'leader',
          });
          membership = await getDefaultTeamMembership();
        });

        it('user should be member of default team', async () => {
          expect(membership).toBeDefined();
        });

        it('user membership should be in leader role', async () => {
          expect(membership?.role).toBe('leader');
        });
      });
    });
  });
});
