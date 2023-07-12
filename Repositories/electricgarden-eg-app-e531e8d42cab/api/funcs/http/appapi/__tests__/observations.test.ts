import {
  GrowableDocument,
  Observation,
  ObservationDocument,
  ObservationValue,
  OrgDocument,
  TeamDocument,
  UserDocument,
} from '@eg/doc-db';
import {
  disconnectDb,
  exampleObservationValue,
  initDb,
  setupExampleGrowable,
  setupExampleGrowableType,
  setupExampleObservation,
  setupExampleSensor,
  setupExampleTeam,
  setupTestTenant,
} from '@eg/test-support';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('observations api', () => {
  let api: UserApi;
  let organisation: OrgDocument;
  let response: request.Response;
  let defaultGrowable: GrowableDocument;
  let user: UserDocument;
  let otherUser: UserDocument;

  beforeAll(async () => {
    await initDb();
    const tenant = await setupTestTenant();
    organisation = tenant.organisation;
    user = tenant.users[0];
    otherUser = tenant.users[1];
    api = await createApiForUser();
  });

  const setupGrowable = async ({ team }: { team?: TeamDocument } = {}) => {
    const sensor = await setupExampleSensor(organisation);
    const type = await setupExampleGrowableType();
    return await setupExampleGrowable(
      organisation,
      team || (await setupExampleTeam(organisation)),
      sensor,
      type,
    );
  };

  beforeEach(async () => {
    await initDb();
    defaultGrowable = await setupGrowable();
  });

  afterAll(disconnectDb);

  const fetchObservationsResponse = async () => {
    response = await api.get(`/observations/${defaultGrowable.id}`);
  };

  const fetchObservationsResponseWithCheck = async () => {
    await fetchObservationsResponse();
    if (!response.ok) {
      throw new Error(
        `Failed to fetch observations, status: ${response.status}`,
      );
    }
  };

  const addObservation = ({
    value,
    growable,
  }: { value?: ObservationValue; growable?: GrowableDocument } = {}) => {
    return setupExampleObservation({
      growable: growable || defaultGrowable,
      recordedBy: user,
      value,
    });
  };

  const mapToExpectResource = ({
    id,
    value,
    occurredOn,
    comments,
    recordedOn,
    recordedByUser,
    createdOn,
  }: ObservationDocument) => ({
    id,
    value: {
      ...value,
      url: expect.anything(),
    },
    occurredOn: occurredOn.toISOString(),
    comments,
    recordedOn: recordedOn.toISOString(),
    recordedBy: { id: recordedByUser.id, name: recordedByUser.name },
    createdOn: createdOn.toISOString(),
  });

  describe('no observations exist for growable, "GET /observations"', () => {
    beforeEach(async () => {
      await fetchObservationsResponse();
    });

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should have empty array response', () => {
      expect(response.body).toEqual([]);
    });
  });

  describe('observations exist for growable', () => {
    let observations: ObservationDocument[];

    beforeEach(async () => {
      observations = await Promise.all([addObservation()]);
    });

    describe('on GET "/observations/:growableId"', () => {
      beforeEach(async () => {
        await fetchObservationsResponseWithCheck();
      });

      it('should return array', () => {
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('array should be populated', () => {
        expect(response.body).toEqual(observations.map(mapToExpectResource));
      });
    });

    describe('on GET "/observations/:growableId/:id"', () => {
      const fetchObservationByIdResponse = async (id: string) => {
        response = await api.get(`/observations/${defaultGrowable.id}/${id}`);
      };

      describe('where observation id does exist', () => {
        let observation: ObservationDocument;
        beforeEach(async () => {
          observation = observations[0];
          await fetchObservationByIdResponse(observation.id);
        });

        it('should return status 200', () => {
          expect(response.status).toBe(200);
        });

        it('response body should be populated', () => {
          expect(response.body).toEqual(mapToExpectResource(observation));
        });
      });

      describe('where observation id does not exist', () => {
        beforeEach(async () => {
          const invalidId = user.id;
          await fetchObservationByIdResponse(invalidId);
        });

        it('should return status 404', () => {
          expect(response.status).toBe(404);
        });
      });

      describe('where observation exists on different growable', () => {
        let observation: ObservationDocument;

        beforeEach(async () => {
          const otherGrowable = await setupGrowable();
          observation = await addObservation({ growable: otherGrowable });
          await fetchObservationByIdResponse(observation.id);
        });

        it('should return status 404', () => {
          expect(response.status).toBe(404);
        });
      });
    });

    describe('on DELETE "/observations/:growableId/:id"', () => {
      const fetchDeleteResponse = async (id: string) => {
        response = await api.delete(
          `/observations/${defaultGrowable.id}/${id}`,
        );
      };

      describe('where observation id does exist', () => {
        let observation: ObservationDocument;
        beforeEach(async () => {
          observation = observations[0];
          await fetchDeleteResponse(observation.id);
        });

        it('should return status 204', () => {
          expect(response.status).toBe(204);
        });

        it('observation should have been deleted', async () => {
          const retrievedObservation = await Observation.findById(
            observation.id,
          );
          expect(retrievedObservation).toBe(null);
        });
      });

      describe('where observation id does not exist', () => {
        beforeEach(async () => {
          const invalidId = user.id;
          await fetchDeleteResponse(invalidId);
        });

        it('should return status 204', () => {
          expect(response.status).toBe(204);
        });
      });

      describe('where observation exists on different growable', () => {
        let observation: ObservationDocument;

        beforeEach(async () => {
          const otherGrowable = await setupGrowable();
          observation = await addObservation({ growable: otherGrowable });
          await fetchDeleteResponse(observation.id);
        });

        it('should return status 204', () => {
          expect(response.status).toBe(204);
        });

        it('observation should not have been deleted', async () => {
          const retrievedObservation = await Observation.findById(
            observation.id,
          );
          expect(retrievedObservation).not.toBe(null);
        });
      });
    });
  });

  describe('on POST "/observations/:growableId"', () => {
    const fetchCreateResponse = async (
      body: Record<string, unknown>,
      { growable }: { growable?: GrowableDocument } = {},
    ) => {
      response = await api.post(
        `/observations/${(growable || defaultGrowable).id}`,
        body,
      );
    };

    const createValidPayload = () => ({
      value: exampleObservationValue(),
      recordedOn: new Date(),
      occurredOn: new Date(),
      comments: 'not much',
    });

    describe('invalid payload', () => {
      describe('nothing in it', () => {
        beforeEach(async () => {
          await fetchCreateResponse({});
        });

        it('response should have 400 status', () => {
          expect(response.status).toBe(400);
        });
      });

      describe('empty value object', () => {
        beforeEach(async () => {
          const payload = {
            ...createValidPayload(),
            value: {},
          };
          await fetchCreateResponse(payload);
        });

        it('response should have 400 status', () => {
          expect(response.status).toBe(400);
        });
      });
    });

    describe('valid payload', () => {
      let payload: any;

      beforeEach(async () => {
        payload = createValidPayload();
        await fetchCreateResponse(payload);
      });

      it('response should have 201 status', () => {
        expect(response.status).toBe(201);
      });

      it('response should be populated', () => {
        const { recordedOn, occurredOn, comments } = payload;
        expect(response.body).toEqual({
          id: expect.toBeString(),
          value: {
            ...payload.value,
            url: expect.anything(),
          },
          recordedBy: { id: user.id, name: user.name },
          comments,
          occurredOn: occurredOn.toISOString(),
          recordedOn: recordedOn.toISOString(),
          createdOn: expect.anything(),
        });
      });

      describe.skip('when not a member of team assigned to growable', () => {
        let userFromOtherTeam: UserDocument;

        beforeEach(async () => {
          userFromOtherTeam = otherUser;
          const otherTeam = await setupExampleTeam(organisation, [
            userFromOtherTeam.id,
          ]);
          const growable = await setupGrowable({ team: otherTeam });
          await fetchCreateResponse(payload, { growable });
        });

        it('response should have 401 status', () => {
          expect(response.status).toBe(401);
        });
      });
    });

    describe('when ocurredOn not supplied', () => {
      let payload: any;

      beforeEach(async () => {
        payload = createValidPayload();
        delete payload.occurredOn;
        await fetchCreateResponse(payload);
      });

      it('ocurredOn should be value of recordedOn', () => {
        const { recordedOn } = payload;
        expect(response.body.occurredOn).toEqual(recordedOn.toISOString());
      });
    });
  });
});
