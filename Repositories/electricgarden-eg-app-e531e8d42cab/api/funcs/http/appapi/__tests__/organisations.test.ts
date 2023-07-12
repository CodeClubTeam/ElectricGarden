import {
  Organisation,
  OrgDocument,
  OrgProperties,
  Team,
  TeamDocument,
  Address,
} from '@eg/doc-db';
import {
  ConfigureUser,
  createConfigureUser,
  disconnectDb,
  exampleOrganisation,
  initDb,
  setupExampleOrg,
  setupTestTenant,
} from '@eg/test-support';
import request from 'supertest';
import { createApiForUser, UserApi } from './helpers';

describe('organisations api', () => {
  let api: UserApi;
  let organisation: OrgDocument;
  let configureUser: ConfigureUser;
  let response: request.Response;

  beforeAll(async () => {
    await initDb();
    const tenant = await setupTestTenant();
    organisation = tenant.organisation;
    api = await createApiForUser();
    configureUser = createConfigureUser();
  });

  beforeEach(async () => {
    await initDb();
    await configureUser.setRole('su');
  });

  afterAll(disconnectDb);

  const fetchOrgsResponse = async () => {
    response = await api.get('/organisations');
  };

  const fetchOrgByIdResponse = async (orgId: string) => {
    response = await api.get(`/organisations/${orgId}`);
  };

  const fetchOrgsResponseWithCheck = async () => {
    await fetchOrgsResponse();
    if (!response.ok) {
      throw new Error(`Failed to fetch users, status: ${response.status}`);
    }
  };

  const mapToExpectResource = ({ name, address }: OrgProperties) => ({
    name,
    address: new Address(address).getProperties(),
    mode: 'standard',
    createdOn: expect.anything(),
    id: expect.anything(),
  });

  const filterOutTenantOrg = (orgs: any[]) =>
    orgs.filter((org: any) => org.id !== organisation.id);

  describe('no orgs exist, "GET /organisations"', () => {
    beforeEach(async () => {
      await fetchOrgsResponse();
    });

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should have only su org in array response', () => {
      expect(filterOutTenantOrg(response.body)).toEqual([]);
    });
  });

  describe('orgs exist', () => {
    let newOrg: OrgDocument;

    beforeEach(async () => {
      newOrg = await setupExampleOrg();
    });

    describe('on GET "/organisations"', () => {
      beforeEach(async () => {
        await fetchOrgsResponseWithCheck();
      });

      it('should return array of organisations', () => {
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('orgs should be be returned', () => {
        expect(filterOutTenantOrg(response.body).length).not.toBeEmpty();
      });
    });

    describe('on GET "/organisations/:orgId"', () => {
      describe('valid org id', () => {
        beforeEach(async () => {
          await fetchOrgByIdResponse(newOrg.id);
        });

        it('response resource should be populated', () => {
          expect(response.body).toEqual(mapToExpectResource(newOrg));
        });
      });

      describe('invalid org id', () => {
        beforeEach(async () => {
          await fetchOrgByIdResponse('thereisnone');
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });

      describe('non existent org id', () => {
        beforeEach(async () => {
          const missingOrgId = newOrg?.id;
          await newOrg?.remove();
          await fetchOrgByIdResponse(missingOrgId);
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });
    });

    describe('on POST "/organisations"', () => {
      const fetchCreateResponse = async (body: Record<string, unknown>) => {
        response = await api.post('/organisations', body);
      };

      describe('invalid payload', () => {
        beforeEach(async () => {
          await fetchCreateResponse({});
        });

        it('response should have 400 status', () => {
          expect(response.status).toBe(400);
        });
      });

      describe('valid payload', () => {
        let validDetails: any;
        let newOrgId: string;

        const getNewOrgTeam = async (): Promise<TeamDocument | null> => {
          const orgTeams = await Team.findByOrganisation(newOrgId);
          return orgTeams[0];
        };

        beforeEach(async () => {
          validDetails = mapToExpectResource(exampleOrganisation());
          await fetchCreateResponse(validDetails);
          if (response.status === 201) {
            newOrgId = response.body.id;
          }
        });

        it('response should have 201 status', () => {
          expect(response.status).toBe(201);
        });

        it('response should be populated', () => {
          expect(response.body).toEqual({
            ...validDetails,
            id: expect.anything(),
            createdOn: expect.anything(),
            defaultTeamId: expect.toBeString(),
          });
        });

        it('default team should be created', async () => {
          expect(await getNewOrgTeam()).toBeDefined();
        });

        it('default teamId should be set', async () => {
          const team = await getNewOrgTeam();
          const org = await Organisation.findOneById(newOrgId);
          expect(org?.defaults.teamId?.equals(team?.id)).toBe(true);
        });

        describe('when org already exists with same name', () => {
          beforeEach(async () => {
            await fetchCreateResponse(validDetails);
          });

          it('response should have 400 status', () => {
            expect(response.status).toBe(400);
          });
        });

        describe('when not in an su role', () => {
          beforeEach(async () => {
            await configureUser.setRole('admin');
            await fetchCreateResponse(validDetails);
          });

          it('response should have 401 status', () => {
            expect(response.status).toBe(401);
          });
        });
      });
    });
  });
});
