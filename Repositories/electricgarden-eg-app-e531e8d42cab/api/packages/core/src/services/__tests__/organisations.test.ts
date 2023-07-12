import {
  Growable,
  Organisation,
  OrgDocument,
  Sensor,
  Team,
  User,
  UserDocument,
} from '@eg/doc-db';
import { disconnectDb, exampleOrganisation, initDb } from '@eg/test-support';

import { createNewOrg } from '../organisations';

const joeAdmin: Parameters<typeof createNewOrg>[0]['admin'] = {
  name: 'Joe Public',
  email: 'joepublic@example.com',
};

describe('organisations', () => {
  beforeEach(async () => {
    await initDb();
  });

  afterAll(disconnectDb);

  describe('creating new org', () => {
    let organisation: OrgDocument;
    let admin: UserDocument | undefined;

    beforeEach(async () => {
      organisation = await createNewOrg({
        organisation: exampleOrganisation(),
        admin: joeAdmin,
      });
      const users = await User.findByOrganisation(organisation.id);
      admin = users[0] || undefined;
    });

    it('org should exist', async () => {
      expect(await Organisation.findOneById(organisation.id)).not.toBeNull();
    });

    it('should have new admin user', () => {
      expect(admin).toBeDefined();
      expect(admin?.role).toBe('admin');
    });

    it('org should have default team', async () => {
      expect(organisation.defaults.teamId).not.toBeNull();
      if (organisation.defaults.teamId) {
        const defaultTeam = await Team.findOneById(
          organisation.defaults.teamId,
        );
        expect(defaultTeam).toBeDefined();
      }
    });
  });
});
