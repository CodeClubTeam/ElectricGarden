import {
  Growable,
  GrowableDocument,
  GrowableTypeDocument,
  Observation,
  OrgDocument,
  Sensor,
  SensorDocument,
  Team,
  TeamDocument,
  UserDocument,
} from '@eg/doc-db';
import {
  setupExampleGrowable,
  setupExampleGrowableType,
  setupExampleObservation,
  setupExampleSensor,
  setupExampleTeam,
  setupTestTenant,
  createConfigureUser,
  disconnectDb,
  initDb,
  ConfigureUser,
} from '@eg/test-support';
import { omit } from 'lodash';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('growables api', () => {
  let api: UserApi;
  let organisation: OrgDocument;
  let configureUser: ConfigureUser;
  let team: TeamDocument;
  let user: UserDocument;
  let sensor: SensorDocument;
  let type: GrowableTypeDocument;
  let response: request.Response;

  beforeAll(async () => {
    await initDb();
    const tenant = await setupTestTenant();
    organisation = tenant.organisation;
    user = tenant.users[0];
    api = await createApiForUser();
    configureUser = createConfigureUser();
  });

  beforeEach(async () => {
    await initDb();
    team = await setupExampleTeam(organisation);
    sensor = await setupExampleSensor(organisation);
    type = await setupExampleGrowableType();
    await configureUser.setRole('leader');
  });

  afterAll(disconnectDb);

  const fetchGrowablesResponse = async () => {
    response = await api.get('/growables');
  };

  const fetchGrowableByIdResponse = async (growableId: string) => {
    response = await api.get(`/growables/${growableId}`);
  };

  const fetchGrowablesResponseWithCheck = async () => {
    await fetchGrowablesResponse();
    if (!response.ok) {
      throw new Error(`Failed to fetch growables, status: ${response.status}`);
    }
  };

  const mapToExpectedType = ({
    id,
    name,
    title,
    observables,
  }: GrowableTypeDocument) => ({
    id,
    name,
    title,
    observables: [...observables],
  });

  const mapToExpectResource = ({
    title,
    typeDoc,
    sensor,
    team,
    notes,
    soilType,
  }: GrowableDocument) => ({
    title,
    teamId: team instanceof Team ? team.id : team,
    sensorId: sensor instanceof Sensor ? sensor.id : sensor,
    type: mapToExpectedType(typeDoc),
    notes,
    soilType,
    createdOn: expect.anything(),
    id: expect.anything(),
  });

  describe('no growables exist, "GET /growables"', () => {
    beforeEach(async () => {
      await fetchGrowablesResponse();
    });

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should have empty array response', () => {
      expect(response.body).toEqual([]);
    });
  });

  describe('growables exist', () => {
    let growable: GrowableDocument;

    beforeEach(async () => {
      growable = await setupExampleGrowable(organisation, team, sensor, type);
    });

    describe('on GET "/growables"', () => {
      beforeEach(async () => {
        await fetchGrowablesResponseWithCheck();
      });

      it('should return array', () => {
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('array should be populated', () => {
        expect(response.body[0]).toEqual(mapToExpectResource(growable));
      });
    });

    describe('on GET "/growables/:growableId"', () => {
      describe('valid id', () => {
        beforeEach(async () => {
          await fetchGrowableByIdResponse(growable.id);
        });

        it('response resource should be populated', () => {
          expect(response.body).toEqual(mapToExpectResource(growable));
        });
      });

      describe('invalid id', () => {
        beforeEach(async () => {
          await fetchGrowableByIdResponse('thereisnone');
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });

      describe('non existent id', () => {
        beforeEach(async () => {
          const growableId = growable.id;
          await growable.remove();
          await fetchGrowableByIdResponse(growableId);
        });

        it('response status should be 404', () => {
          expect(response.status).toBe(404);
        });
      });
    });

    describe('on DELETE "/growables/:growableId"', () => {
      const fetchDeleteGrowableByIdResponse = async (growableId: string) => {
        response = await api.delete(`/growables/${growableId}`);
      };
      describe('valid growable id', () => {
        beforeEach(async () => {
          await setupExampleObservation({
            growable,
            recordedBy: user,
          });
          await fetchDeleteGrowableByIdResponse(growable.id);
        });

        it('response status should be 204', () => {
          expect(response.status).toBe(204);
        });

        it('growable should no longer exist', async () => {
          expect(await Growable.findById(growable.id)).toBe(null);
        });

        it('attached observations should be deleted', async () => {
          expect(await Observation.findByGrowableId(growable.id)).toBeEmpty();
        });
      });

      describe('non existent growable id', () => {
        beforeEach(async () => {
          const growableId = growable.id;
          await growable.remove();
          await fetchDeleteGrowableByIdResponse(growableId);
        });

        it('response status should be 204', () => {
          expect(response.status).toBe(204);
        });
      });

      describe('when not a leader role', () => {
        beforeEach(async () => {
          await configureUser.setRole('member');
          await fetchDeleteGrowableByIdResponse(growable.id);
        });

        it('response should have 401 status', () => {
          expect(response.status).toBe(401);
        });
      });
    });
  });

  describe('on POST "/growable"', () => {
    const fetchCreateResponse = async (body: Record<string, unknown>) => {
      response = await api.post('/growables', body);
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
          title: 'Kumara Plot 2',
          teamId: team.id,
          sensorId: sensor.id,
          typeId: type.id,
          notes: 'Super excited',
          soilType: 'Rotten silage',
        };
        await fetchCreateResponse(validDetails);
      });

      it('response should have 201 status', () => {
        expect(response.status).toBe(201);
      });

      it('response should be populated', () => {
        expect(response.body).toEqual({
          ...omit(validDetails, 'typeId'),
          type: mapToExpectedType(type),
          id: expect.anything(),
          createdOn: expect.anything(),
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

  describe('on PATCH "/growables/{growableId}"', () => {
    let growableId: string;
    let growable: GrowableDocument;

    const fetchUpdateResponse = async (
      growableId: string,
      body: Record<string, unknown>,
    ) => {
      response = await api.patch(`/growables/${growableId}`, body);
    };

    const retrieveGrowable = async () => {
      const retrievedGrowable = await Growable.findOneById(growableId);
      if (!retrievedGrowable) {
        throw new Error('Tests broken');
      }
      return retrievedGrowable;
    };

    const createValidUpdatePayload = async () => {
      const otherTeam = await setupExampleTeam(organisation);
      const otherSensor = await setupExampleSensor(organisation);
      return {
        title: 'Runner Bean',
        teamId: otherTeam.id,
        sensorId: otherSensor.id,
        notes: 'Scarlet runner',
        soilType: 'clay',
      };
    };

    beforeEach(async () => {
      growable = await setupExampleGrowable(organisation, team, sensor, type);
      growableId = growable.id;
    });

    describe('empty payload', () => {
      beforeEach(async () => {
        await fetchUpdateResponse(growableId, {});
      });

      it('response should have 200 status', () => {
        expect(response.status).toBe(200);
      });
    });

    describe('typeId in payload', () => {
      beforeEach(async () => {
        // can't update typeId
        const otherType = await setupExampleGrowableType();
        await fetchUpdateResponse(growableId, { typeId: otherType.id });
      });

      it('response should have 200 status', () => {
        expect(response.status).toBe(200);
      });

      it('values should NOT be updated', async () => {
        const { typeId } = await retrieveGrowable();
        expect(typeId).toEqual(type.id);
      });
    });

    describe('valid payload', () => {
      let updatePayload: any;
      let updatedGrowable: GrowableDocument;

      beforeEach(async () => {
        updatePayload = await createValidUpdatePayload();
        await fetchUpdateResponse(growableId, updatePayload);
        updatedGrowable = await retrieveGrowable();
      });

      it('values should be updated', () => {
        const { title, teamId, sensorId, notes, soilType } = updatedGrowable;
        expect({ title, teamId, sensorId, notes, soilType }).toEqual(
          updatePayload,
        );
      });
    });

    describe('when growable doesnt exist with same id', () => {
      beforeEach(async () => {
        const invalidGrowableId = team.id;
        await fetchUpdateResponse(
          invalidGrowableId,
          await createValidUpdatePayload(),
        );
      });

      it('response should have 412 status', () => {
        expect(response.status).toBe(412);
      });
    });

    describe('when not a leader role', () => {
      beforeEach(async () => {
        await configureUser.setRole('member');
        await fetchUpdateResponse(growableId, await createValidUpdatePayload());
      });

      it('response should have 401 status', () => {
        expect(response.status).toBe(401);
      });
    });
  });
});
