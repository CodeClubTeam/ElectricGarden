import {
  GoldilocksRule,
  GoldilocksRuleDocument,
  Growable,
  SampleMetric,
  sampleMetrics,
} from '@eg/doc-db';
import * as yup from 'yup';

import { AppRequestHandler } from '../typings';

interface GoldilocksRulesResource {
  title: string;
  min?: number;
  max?: number;
  metric: SampleMetric;
}

const mapToResource = ({
  title,
  min,
  max,
  metric,
}: GoldilocksRuleDocument): GoldilocksRulesResource => ({
  title,
  min,
  max,
  metric,
});

const growableIdFromParamsValidator = yup
  .object()
  .shape({
    growableId: yup.string().required(),
  })
  .required();

export const getList: AppRequestHandler = async (req, res) => {
  const { growableId } = growableIdFromParamsValidator.validateSync(req.params);

  const growable = await Growable.findById(growableId)
    .populate('goldilocksRules')
    .exec();
  if (!growable) {
    return res.sendStatus(404);
  }
  if (!growable._organisation.equals(req.user.organisationId)) {
    return res.sendStatus(403);
  }

  if (!Array.isArray(growable.goldilocksRules)) {
    res.send([]);
  }

  const rules = growable.goldilocksRules.filter(
    (r): r is GoldilocksRuleDocument => typeof r !== 'string', // filter out ids (should be just docs due to populate())
  );

  res.send(rules.map(mapToResource));
};

const createValidator = yup
  .object({
    metric: yup.string().oneOf(sampleMetrics).required(),
    title: yup.string().required(),
    min: yup.number().optional(),
    max: yup.number().optional(),
  })
  .required();

export const create: AppRequestHandler = async (req, res) => {
  const { growableId } = growableIdFromParamsValidator.validateSync(req.params);
  const { metric, title, min, max } = await createValidator.validate(req.body);

  const growable = await Growable.findById(growableId)
    .populate('goldilocksRules')
    .exec();
  if (!growable) {
    throw new yup.ValidationError(
      `Growable not found with id: ${growableId}`,
      growableId,
      'growableId',
    );
  }
  if (!growable._organisation.equals(req.user.organisationId)) {
    return res.sendStatus(403);
  }

  const rule = new GoldilocksRule({
    title,
    metric,
    min,
    max,
  });

  growable.goldilocksRules.push(rule);

  await growable.save();

  res
    .status(201)
    .location(`/v1/growables/${growable.id}/goldilocks-rules`)
    .send(mapToResource(rule));
};
create.requiredRole = 'leader' as const;
