import {
  OrgDocument,
  Sensor,
  SensorDocument,
  ThingDocument,
  GrowableDocument,
  Growable,
  Point,
  PointDocument,
} from '@eg/doc-db';
import {
  ConfigureUser,
  createConfigureUser,
  disconnectDb,
  initDb,
  setupExamplePoints,
  setupExampleSensor,
  setupExampleThing,
  setupTestTenant,
  setupExampleGrowable,
  setupExampleTeam,
  setupExampleGrowableType,
} from '@eg/test-support';
import request from 'supertest';

import { createApiForUser, UserApi } from './helpers';

describe('transfer sensor api', () => {
  let api: UserApi;
  let organisation: OrgDocument;
  let configureUser: ConfigureUser;
  let response: request.Response;
  let sourceThing: ThingDocument;
  let sourceSensor: SensorDocument;
  let targetThing: ThingDocument;
  let attachedGrowables: GrowableDocument[];
  let dataPoints: PointDocument[];

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
    sourceThing = await setupExampleThing();
    targetThing = await setupExampleThing();
    sourceSensor = await setupExampleSensor(organisation, sourceThing);
    dataPoints = await setupExamplePoints(sourceSensor.serial, 5);
    const team = await setupExampleTeam(organisation);
    const growableType = await setupExampleGrowableType();
    attachedGrowables = await Promise.all([
      setupExampleGrowable(organisation, team, sourceSensor, growableType),
      setupExampleGrowable(organisation, team, sourceSensor, growableType),
    ]);
  });

  afterAll(disconnectDb);

  const postMigrateSensor = async (
    sourceSerial: string,
    targetSerial: string,
  ) => {
    response = await api.post('/admin/sensors', {
      method: 'migrate',
      details: {
        sourceSerial,
        targetSerial,
      },
    });
  };

  const postMigrateSensorWithCheck = async (
    ...args: Parameters<typeof postMigrateSensor>
  ) => {
    await postMigrateSensor(...args);
    if (!response.ok) {
      throw new Error(
        `Failed to post to sensors, status: ${response.status} body: ${response.text}`,
      );
    }
  };

  const getTargetSensor = () => Sensor.findOneBySerial(targetThing.serial);

  describe('migrate existing sensor with data', () => {
    beforeEach(async () => {
      await postMigrateSensorWithCheck(sourceSensor.serial, targetThing.serial);
    });

    it('target sensor should be created', async () => {
      expect(await getTargetSensor()).not.toBeNull();
    });

    it('target sensor should be assigned to org of source sensor', async () => {
      const targetSensor = await getTargetSensor();
      expect(
        targetSensor?._organisation.equals(sourceSensor._organisation),
      ).toBe(true);
    });

    it('target sensor should have same name as source sensor', async () => {
      const targetSensor = await getTargetSensor();
      expect(targetSensor?.name).toBe(sourceSensor.name);
    });

    it('growables should be attached to target sensor', async () => {
      const targetSensor = await getTargetSensor();
      if (targetSensor) {
        const growablesOnTarget = await Growable.findBySensor(targetSensor);
        expect(growablesOnTarget.map((g) => g.id)).toIncludeSameMembers(
          attachedGrowables.map((g) => g.id),
        );
      }
    });

    it('growables should be detatched from source sensor', async () => {
      expect(await Growable.findBySensor(sourceSensor)).toBeEmpty();
    });

    it('source sensor should be removed (detached from org)', async () => {
      expect(await Sensor.findOneBySerial(sourceThing.serial)).toBeNull();
    });

    it('all data points on source sensor should be on target sensor', async () => {
      const pointsOnTargetSensor = await Point.find({
        nodeSerial: targetThing.serial,
      });
      expect(pointsOnTargetSensor.map((p) => p.id)).toEqual(
        dataPoints.map((p) => p.id),
      );
    });

    it('no points on source sensor', async () => {
      const pointsOnSourceSensor = await Point.find({
        nodeSerial: sourceSensor.serial,
      });
      expect(pointsOnSourceSensor).toBeEmpty();
    });
  });

  describe('source sensor not found', () => {
    beforeEach(async () => {
      await postMigrateSensor(targetThing.serial, targetThing.serial);
    });

    it('response should be 400', () => {
      expect(response.status).toBe(400);
    });

    it('target sensor should not be assigned', async () => {
      expect(await getTargetSensor()).toBeNull();
    });
  });

  describe('target sensor already assigned to an org', () => {
    beforeEach(async () => {
      await setupExampleSensor(organisation, targetThing);
      await postMigrateSensor(sourceSensor.serial, targetThing.serial);
    });

    it('response should be 400', () => {
      expect(response.status).toBe(400);
    });

    it('target sensor should not be updated', async () => {
      const targetSensor = await getTargetSensor();
      expect(targetSensor?.name).not.toBe(sourceSensor.name);
    });
  });
});
