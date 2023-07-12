import {
  GoldilocksRule,
  GoldilocksRuleDocument,
  GrowableDocument,
  OrgDocument,
  SensorDocument,
  TeamDocument,
} from '@eg/doc-db';
import {
  disconnectDb,
  exampleOrganisation,
  initDb,
  setupExampleGrowable,
  setupExampleSensor,
  setupExampleTeam,
} from '@eg/test-support';

import { getMatchingGoldilocksZones } from '../goldilocksZones';
import { createNewOrg } from '../organisations';

type Sample = Parameters<typeof getMatchingGoldilocksZones>[1];

// this test is fine and runs locally but inexplicably fails intermittently
// in CI. Spent too much time on this already so putting ignore flag on for now.
describe('getMatchingGoldilocksZones', () => {
  let organisation: OrgDocument;
  let sensor: SensorDocument;

  const sample = (overrides?: Partial<Sample>): Sample => ({
    timestamp: new Date(),
    light: 12,
    co2: 401,
    probeSoilTemp: 12,
    probeAirTemp: 2,
    ...overrides,
  });

  beforeEach(async () => {
    await initDb();
    organisation = await createNewOrg({ organisation: exampleOrganisation() });
  });

  afterAll(disconnectDb);

  describe('no sensor exists for serial', () => {
    it('should return []', async () => {
      expect(await getMatchingGoldilocksZones('notfound', sample())).toEqual(
        [],
      );
    });
  });

  describe('sensor', () => {
    beforeEach(async () => {
      sensor = await setupExampleSensor(organisation);
    });

    const getMatches = (sampleOverride?: Partial<Sample>) =>
      getMatchingGoldilocksZones(sensor.serial, sample(sampleOverride));

    describe('no growable exists for sensor', () => {
      it('should return []', async () => {
        expect(await getMatches()).toEqual([]);
      });
    });

    describe('growable', () => {
      let growable: GrowableDocument;
      let team: TeamDocument;

      const setupRule = async (props: Partial<GoldilocksRuleDocument>) => {
        const rule = new GoldilocksRule({
          ...props,
        });
        growable.goldilocksRules.push(rule);
        await growable.save();
        return rule;
      };

      beforeEach(async () => {
        team = await setupExampleTeam(organisation);
        growable = await setupExampleGrowable(organisation, team, sensor);
      });

      describe('no rules exist on growable', () => {
        it('should return []', async () => {
          expect(await getMatches()).toEqual([]);
        });
      });

      describe('rules exist', () => {
        const ambientTemp = 1;
        let matchingRule: GoldilocksRuleDocument;
        let matches: any;

        beforeEach(async () => {
          matchingRule = await setupRule({
            title: 'Not in risk of freezing',
            metric: 'ambientTemp',
            min: 2,
          });
          await setupRule({
            title: 'Not freezing temps',
            metric: 'ambientTemp',
            min: 0,
          });
          matches = await getMatches({ ambientTemp });
        });

        it('should return only matching rule', () => {
          expect(matches).toBeArrayOfSize(1);
        });

        it('returned entry should be matching rule', () => {
          const { title, metric, min, max } = matchingRule;
          expect(matches[0]).toHaveProperty('rule', {
            title,
            metric,
            min,
            max,
          });
        });

        it('returned entry should have growable details', () => {
          const { id, title, teamId } = growable;
          expect(matches[0]).toHaveProperty('growable', { id, title, teamId });
        });

        it('returned entry should have metric value from sample', () => {
          expect(matches[0]).toHaveProperty('value', ambientTemp);
        });
      });
    });
  });
});
