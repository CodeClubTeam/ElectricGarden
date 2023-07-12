import {
  GoldilocksRuleDocument,
  GrowableDocument,
  OrgDocument,
  UserDocument,
} from '@eg/doc-db';
import {
  ConfigureUser,
  createConfigureUser,
  disconnectDb,
  initDb,
  setupExampleGoldilocksRule,
  setupExampleGrowable,
  setupTestTenant,
} from '@eg/test-support';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('goldlocks rules api', () => {
  let api: UserApi;
  let organisation: OrgDocument;
  let configureUser: ConfigureUser;
  let user: UserDocument;
  let growable: GrowableDocument;
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
    growable = await setupExampleGrowable(organisation);
    await configureUser.setRole('leader');
  });

  afterAll(disconnectDb);

  const fetchRulesResponse = async () => {
    response = await api.get(`/growables/${growable.id}/goldilocks-rules`);
  };

  const fetchRulesResponseWithCheck = async () => {
    await fetchRulesResponse();
    if (!response.ok) {
      throw new Error(`Failed to fetch rules, status: ${response.status}`);
    }
  };

  const mapToExpectResource = ({
    title,
    metric,
    min,
    max,
  }: GoldilocksRuleDocument) => ({
    title,
    metric,
    min,
    max,
  });

  describe('no rules exist, "GET /growables/:growableId/goldlocks-rules"', () => {
    beforeEach(async () => {
      await fetchRulesResponse();
    });

    it('should return 200 status', () => {
      expect(response.status).toBe(200);
    });

    it('should have empty array response', () => {
      expect(response.body).toEqual([]);
    });
  });

  describe('rules exist', () => {
    let rule: GoldilocksRuleDocument;

    beforeEach(async () => {
      rule = await setupExampleGoldilocksRule(growable);
    });

    describe('on GET rules', () => {
      beforeEach(async () => {
        await fetchRulesResponseWithCheck();
      });

      it('should return array', () => {
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('array should be populated', () => {
        expect(response.body[0]).toEqual(mapToExpectResource(rule));
      });
    });
  });

  describe('on POST "/growable/:growableId/goldilocks-rules"', () => {
    const fetchCreateResponse = async (body: Record<string, unknown>) => {
      response = await api.post(
        `/growables/${growable.id}/goldilocks-rules`,
        body,
      );
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
      let validDetails: Partial<GoldilocksRuleDocument>;

      beforeEach(async () => {
        validDetails = {
          title: 'Frost free',
          metric: 'probeAirTemp',
          min: 2,
        };
        await fetchCreateResponse(validDetails);
      });

      it('response should have 201 status', () => {
        expect(response.status).toBe(201);
      });

      it('response should have rule in body', () => {
        expect(response.body).toEqual(validDetails);
      });

      it('should save rule added', async () => {
        await fetchRulesResponseWithCheck();
        expect(response.body).toBeArrayOfSize(1);
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
});
