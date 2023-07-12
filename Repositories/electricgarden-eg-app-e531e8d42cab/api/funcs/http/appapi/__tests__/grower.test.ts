import { OrgDocument, TeamDocument, UserDocument } from '@eg/doc-db';
import {
  setupExampleTeam,
  setupTestTenant,
  testUsers,
  disconnectDb,
  initDb,
  createConfigureUser,
  ConfigureUser,
} from '@eg/test-support';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('grower api', () => {
  let api: UserApi;
  let organisation: OrgDocument;
  let apiUser: UserDocument;
  let configureUser: ConfigureUser;
  let team: TeamDocument;
  let response: request.Response;

  beforeAll(async () => {
    await initDb();
    const tenant = await setupTestTenant();
    organisation = tenant.organisation;
    const mrHappy = tenant.users.find(
      (u) => u.email === testUsers.mrhappy.email,
    );
    if (!mrHappy) {
      // eslint-disable-next-line quotes
      throw new Error("tests broken, couldn't find test user");
    }
    apiUser = mrHappy;
    api = await createApiForUser({ user: 'mrhappy' });
    configureUser = createConfigureUser('mrhappy');
  });

  beforeEach(async () => {
    await initDb();
  });

  afterAll(disconnectDb);

  const fetchGrowerResponse = async () => {
    response = await api.get('/grower');
  };

  const mapToExpectResource = (
    { id, name, email, role, learner, status }: UserDocument,
    teams: TeamDocument[] = [],
  ) => ({
    id,
    name,
    email,
    role,
    learnerLevel: learner ? learner.level : 0,
    createdOn: expect.anything(),
    status,
    organisation: {
      id: organisation.id,
      name: organisation.name,
      mode: organisation.mode,
    },
    teams: teams.map(({ id, name }) => ({ id, name })),
  });

  describe('GET /grower', () => {
    describe('user in database"', () => {
      describe('user not in any team', () => {
        beforeEach(async () => {
          await fetchGrowerResponse();
        });

        it('should return 200 status', () => {
          expect(response.status).toBe(200);
        });

        it('response resource should be populated', () => {
          expect(response.body).toEqual(mapToExpectResource(apiUser));
        });
      });

      describe('user in team', () => {
        beforeEach(async () => {
          team = await setupExampleTeam(organisation, [apiUser.id]);
          await fetchGrowerResponse();
        });

        it('should return 200 status', () => {
          expect(response.status).toBe(200);
        });

        it('response resource should be populated including teams', () => {
          expect(response.body).toEqual(mapToExpectResource(apiUser, [team]));
        });
      });

      describe('user not in any team but superuser role', () => {
        beforeEach(async () => {
          apiUser = await configureUser.setRole('su');
          team = await setupExampleTeam(organisation, []);
          await fetchGrowerResponse();
        });

        it('should return 200 status', () => {
          expect(response.status).toBe(200);
        });

        it('response resource should be populated including teams', () => {
          expect(response.body).toEqual(mapToExpectResource(apiUser, [team]));
        });
      });
    });
  });
});
