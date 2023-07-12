import { ObjectId } from 'mongodb';
import { OrgDocument, Team, Organisation } from '@eg/doc-db';
import { disconnectDb, exampleOrganisation, initDb } from '@eg/test-support';

import { createNewOrg } from '../organisations';

describe('teams', () => {
  let organisation: OrgDocument;

  beforeEach(async () => {
    await initDb();
    organisation = await createNewOrg({ organisation: exampleOrganisation() });
  });

  afterAll(disconnectDb);

  describe('removing default team', () => {
    let defaultTeamId: ObjectId;

    beforeEach(async () => {
      if (!organisation.defaults.teamId) {
        throw new Error('Test error, expected new org to have a default team');
      }
      defaultTeamId = organisation.defaults.teamId;
      const defaultTeam = await Team.findOneById(defaultTeamId);
      await defaultTeam?.remove();
    });

    it('default team should no longer exist', async () => {
      expect(await Team.findOneById(defaultTeamId)).toBeNull();
    });

    it('org default team id should be unset', async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      organisation = (await Organisation.findOneById(organisation.id))!;
      expect(organisation.defaults.teamId).toBeUndefined();
    });
  });
});
