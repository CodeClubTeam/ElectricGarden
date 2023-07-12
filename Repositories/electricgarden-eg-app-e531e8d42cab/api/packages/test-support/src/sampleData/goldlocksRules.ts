import {
  GoldilocksRule,
  GoldilocksRuleDocument,
  GrowableDocument,
  sampleMetrics,
} from '@eg/doc-db';
import faker from 'faker';

export const exampleGoldlocksRule = (): Partial<GoldilocksRuleDocument> => ({
  title: faker.lorem.word(),
  metric: sampleMetrics[faker.random.number(sampleMetrics.length - 1)],
  min: faker.random.number(40),
});

export const setupExampleGoldilocksRule = async (
  growable: GrowableDocument,
) => {
  const rule = new GoldilocksRule(exampleGoldlocksRule());
  growable.goldilocksRules.push(rule);
  await growable.save();
  return rule;
};
