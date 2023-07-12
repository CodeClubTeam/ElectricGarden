import {
  OrgDocument,
  Team,
  TeamDocument,
  TeamMembership,
  UserDocument,
} from '@eg/doc-db';
import {
  ConfigureUser,
  createConfigureUser,
  disconnectDb,
  exampleTeam,
  initDb,
  setupExampleGrowable,
  setupExampleGrowableType,
  setupExampleSensor,
  setupTestOrg,
  setupTestTenant,
} from '@eg/test-support';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('teams api', () => {
  let api: UserApi;
  let users: UserDocument[];
  let organisation: OrgDocument;
  let configureUser: ConfigureUser;
  let response: request.Response;

  beforeAll(async () => {
    await initDb();
    const tenant = await setupTestTenant();
    users = tenant.users;
    organisation = tenant.organisation;
    api = await createApiForUser();
    configureUser = createConfigureUser();
  });

  beforeEach(async () => {
    await initDb();
    await configureUser.setRole('leader');
  });

  afterAll(disconnectDb);

  const fetchTeamsResponse = async () => {
    response = await api.get('/team');
  };

  const fetchTeamByIdResponse = async (teamId: string) => {
    response = await api.get(`/team/${teamId}`);
  };

  const fetchTeamsResponseWithCheck = async () => {
    await fetchTeamsResponse();
    if (!response.ok) {
      throw new Error(`Failed to fetch teams, status: ${response.status}`);
    }
  };

  const addTeam = async (...users: UserDocument[]) => {
    const team = new Team(exampleTeam(organisation));
    for (const user of users) {
      team.memberships.push(new TeamMembership({ userId: user.id }));
    }
    await team.save();
    return team;
  };

  const mapToExpectResource = ({ name, memberships }: TeamDocument) => ({
    name,
    memberships: expect.toIncludeSameMembers(
      memberships.map(({ userId, role }) => ({
        userId: userId.toHexString(),
        role: role || 'member',
      })),
    ),
    createdOn: expect.anything(),
    id: expect.anything(),
  });

  describe('no teams exist, "GET /team"', () => {
    beforeEach(async () => {
      await fetchTeamsResponse();
    });

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should have empty array response', () => {
      expect(response.body).toEqual([]);
    });
  });

  describe('teams exist', () => {
    let team: TeamDocument;

    beforeEach(async () => {
      team = await addTeam(users[0]);
    });

    describe('on GET "/team"', () => {
      beforeEach(async () => {
        await fetchTeamsResponseWithCheck();
      });

      it('should return array of teams', () => {
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('teams should be populated', () => {
        expect(response.body[0]).toEqual(mapToExpectResource(team));
      });
    });

    describe('on GET "/team/:teamId"', () => {
      describe('valid team id', () => {
        beforeEach(async () => {
          await fetchTeamByIdResponse(team.id);
        });

        it('response resource should be populated', () => {
          expect(response.body).toEqual(mapToExpectResource(team));
        });
      });

      describe('invalid team id', () => {
        beforeEach(async () => {
          await fetchTeamByIdResponse('thereisnone');
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });

      describe('non existent team id', () => {
        beforeEach(async () => {
          const teamId = team.id;
          await team.remove();
          await fetchTeamByIdResponse(teamId);
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });

      describe('with userId in query', () => {
        let user: UserDocument;

        const fetchTeamsForUserIdResponse = async (userId: string) => {
          response = await api.get(`/team?userId=${userId}`);
        };

        beforeEach(() => {
          user = users[1];
        });

        describe('where user not in any team', () => {
          beforeEach(async () => {
            await fetchTeamsForUserIdResponse(user.id);
          });

          it('response status should be 200', () => {
            expect(response.status).toBe(200);
          });

          it('should return empty array of teams', () => {
            expect(response.body).toEqual([]);
          });
        });

        describe('where user in two of three teams', () => {
          let teamsMemberOf: TeamDocument[];

          beforeEach(async () => {
            teamsMemberOf = await Promise.all([addTeam(user), addTeam(user)]);
            await addTeam();
            await fetchTeamsForUserIdResponse(user.id);
          });

          it('response status should be 200', () => {
            expect(response.status).toBe(200);
          });

          it('should return only teams user is member of', () => {
            expect(
              response.body.map((team: any) => team.name),
            ).toIncludeSameMembers(teamsMemberOf.map(({ name }) => name));
          });
        });
      });
    });

    describe('on DELETE "/team/:teamId"', () => {
      const fetchDeleteTeamByIdResponse = async (teamId: string) => {
        response = await api.delete(`/team/${teamId}`);
      };

      describe('valid team id', () => {
        beforeEach(async () => {
          await fetchDeleteTeamByIdResponse(team.id);
        });

        it('response status should be 204', () => {
          expect(response.status).toBe(204);
        });

        it('team should no longer exist', async () => {
          expect(await Team.findById(team.id)).toBeFalsy();
        });
      });

      describe('non existent team id', () => {
        beforeEach(async () => {
          const teamId = team.id;
          await team.remove();
          await fetchDeleteTeamByIdResponse(teamId);
        });

        it('response status should be 204', () => {
          expect(response.status).toBe(204);
        });
      });

      describe('when not a leader role', () => {
        beforeEach(async () => {
          await configureUser.setRole('member');
          await fetchDeleteTeamByIdResponse(team.id);
        });

        it('response should have 401 status', () => {
          expect(response.status).toBe(401);
        });
      });

      describe('when team has a growable', () => {
        beforeEach(async () => {
          const sensor = await setupExampleSensor(organisation);
          const growableType = await setupExampleGrowableType();
          await setupExampleGrowable(organisation, team, sensor, growableType);

          await fetchDeleteTeamByIdResponse(team.id);
        });

        it('response should have 412 status', () => {
          expect(response.status).toBe(412);
        });
      });
    });
  });

  describe('on POST "/team"', () => {
    const fetchCreateResponse = async (body: Record<string, unknown>) => {
      response = await api.post('/team', body);
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

      beforeEach(async () => {
        validDetails = {
          name: 'Canterbury Rams',
          memberships: [
            { userId: users[0].id, role: 'leader' },
            { userId: users[1].id },
          ],
        };
        await fetchCreateResponse(validDetails);
      });

      it('response should have 201 status', () => {
        expect(response.status).toBe(201);
      });

      it('response should be populated', () => {
        expect(response.body).toEqual({
          ...validDetails,
          memberships: expect.toIncludeSameMembers(
            validDetails.memberships.map(({ userId, role }: any) => ({
              userId,
              role: role || 'member',
            })),
          ),
          id: expect.anything(),
          createdOn: expect.anything(),
        });
      });

      describe('when team already exists with same name', () => {
        beforeEach(async () => {
          await fetchCreateResponse(validDetails);
        });

        it('response should have 400 status', () => {
          expect(response.status).toBe(400);
        });
      });

      describe('when not a leader role', () => {
        beforeEach(async () => {
          await configureUser.setRole('member');
          await fetchCreateResponse(validDetails);
        });

        it('response should have 401 status', () => {
          expect(response.status).toBe(401);
        });
      });
    });
  });

  describe('on PUT "/team/{teamId}"', () => {
    let teamId: string;
    let team: TeamDocument;

    const fetchUpdateResponse = async (
      teamId: string,
      body: Record<string, unknown>,
    ) => {
      response = await api.put(`/team/${teamId}`, body);
    };

    const retrieveTeam = async () => {
      const retrievedTeam = await Team.findOneById(teamId);
      if (!retrievedTeam) {
        throw new Error('Tests broken');
      }
      return retrievedTeam;
    };

    const createValidUpdatePayload = () => ({
      name: 'Otago Owls',
      memberships: [
        { userId: users[0].id, role: 'leader' }, // change to leader role
        { userId: users[1].id, role: 'member' }, // add
      ],
    });

    beforeEach(async () => {
      team = await addTeam(users[0]);
      teamId = team.id;
    });

    describe('invalid payload', () => {
      beforeEach(async () => {
        await fetchUpdateResponse(teamId, {});
      });

      it('response should have 400 status', () => {
        expect(response.status).toBe(400);
      });
    });

    describe('valid payload with add and update membership', () => {
      let updatePayload: any;

      beforeEach(async () => {
        updatePayload = createValidUpdatePayload();
        await fetchUpdateResponse(teamId, updatePayload);
      });

      it('response should have 200 status', () => {
        expect(response.status).toBe(200);
      });

      it('response should be populated', () => {
        expect(response.body).toEqual({
          name: updatePayload.name,
          memberships: expect.toBeArrayOfSize(updatePayload.memberships.length),
          id: team.id,
          createdOn: expect.anything(),
        });
      });

      it('team should be updated', async () => {
        const retrievedTeam = await retrieveTeam();
        expect(retrievedTeam.name).toEqual(updatePayload.name);
        expect(mapToExpectResource(retrievedTeam).memberships).toEqual(
          updatePayload.memberships,
        );
      });
    });

    describe('valid payload with remove membership', () => {
      let updatePayload: any;

      beforeEach(async () => {
        updatePayload = {
          name: 'Otago Owls',
          memberships: [
            // removing user[0]
          ],
        };
        await fetchUpdateResponse(teamId, updatePayload);
      });

      it('team should be updated', async () => {
        expect((await retrieveTeam()).memberships).toHaveLength(0);
      });
    });

    describe('when userId in two memberships', () => {
      beforeEach(async () => {
        const updatePayload = createValidUpdatePayload();
        const dupeUserId = users[0].id;
        updatePayload.memberships = [
          { userId: dupeUserId, role: 'leader' },
          { userId: dupeUserId, role: 'member' },
        ];
        await fetchUpdateResponse(teamId, updatePayload);
      });

      it('response should have 400 status', () => {
        expect(response.status).toBe(400);
      });
    });

    describe('when team doesnt exist with same name', () => {
      beforeEach(async () => {
        const invalidTeamId = users[0].id;
        await fetchUpdateResponse(invalidTeamId, createValidUpdatePayload());
      });

      it('response should have 412 status', () => {
        expect(response.status).toBe(412);
      });
    });

    describe('when not a leader role', () => {
      beforeEach(async () => {
        await configureUser.setRole('member');
        await fetchUpdateResponse(teamId, createValidUpdatePayload());
      });

      it('response should have 401 status', () => {
        expect(response.status).toBe(401);
      });
    });

    // multi-tenancy isolation test
    // TODO: this needs to be cross cutting concern
    describe('when in other org', () => {
      let otherOrgApi: UserApi;

      beforeEach(async () => {
        const otherOrg = await setupTestOrg({ separate: true });
        otherOrgApi = await createApiForUser({
          impersonateOrgId: otherOrg.id,
        });
      });

      describe('deleting team', () => {
        beforeEach(async () => {
          team = await addTeam(); // added in main org
          await configureUser.setRole('su');
          response = await otherOrgApi.delete(`/team/${team.id}`); // delete from other org
        });

        it('should return error', () => {
          expect(response.ok).toBe(false);
        });

        it('should not remove team', async () => {
          expect(await Team.findById(team.id)).toBeDefined();
        });
      });
    });
  });
});
