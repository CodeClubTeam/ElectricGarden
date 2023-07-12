import {
  Growable,
  Observation,
  ObservationDocument,
  ObservationValue,
} from '@eg/doc-db';
import * as yup from 'yup';
import { getSignedDownloadUrl } from '../services/assetStore';
import { deleteObservation } from '../services/observationsService';
import { AppRequestHandler } from '../typings';

interface ObservationResource {
  id: string;
  value: ObservationValue;
  recordedBy: { id: string; name: string };
  recordedOn: Date;
  occurredOn: Date;
  comments?: string;
  createdOn: Date;
}

const mapValue = (value: ObservationValue) => {
  switch (value.type) {
    case 'photographed':
      return {
        ...value,
        url: getSignedDownloadUrl((value as any).data.assetId),
      };

    default:
      return value;
  }
};

const mapToResource = ({
  id,
  value,
  recordedByUser,
  recordedOn,
  createdOn,
  occurredOn,
  comments,
}: ObservationDocument): ObservationResource => ({
  id,
  value: mapValue(value),
  recordedBy: { id: recordedByUser.id, name: recordedByUser.name },
  recordedOn,
  createdOn,
  occurredOn,
  comments,
});

const growableIdFromParamsValidator = yup
  .object()
  .shape({
    growableId: yup.string().required(),
  })
  .required();

const growableIdAndIdFromParamsValidator = yup
  .object()
  .shape({
    growableId: yup.string().required(),
    id: yup.string().required(),
  })
  .required();

export const getListByGrowable: AppRequestHandler = async (req, res) => {
  const { growableId } = growableIdFromParamsValidator.validateSync(req.params);
  const observations = await Observation.findByGrowableId(growableId);
  res.send(observations.map(mapToResource));
};

export const getById: AppRequestHandler = async (req, res) => {
  const { growableId, id } = growableIdAndIdFromParamsValidator.validateSync(
    req.params,
  );
  const observation = await Observation.findById(id).populate('recordedBy');
  if (!observation || !observation.growableId.equals(growableId)) {
    return res.sendStatus(404);
  }

  res.send(mapToResource(observation));
};

const observationValidator = yup
  .object()
  .shape({
    recordedOn: yup.date().required(),
    value: yup
      .object()
      .shape({
        type: yup.string().required(),
      })
      .required(),
    occurredOn: yup.date(),
    comments: yup.string(),
  })
  .required();

export const create: AppRequestHandler = async (req, res) => {
  const { growableId } = growableIdFromParamsValidator.validateSync(req.params);
  const {
    value,
    recordedOn,
    occurredOn,
    comments,
  } = await observationValidator.validate(req.body);
  if (!(await Growable.findOneById(growableId))) {
    // TODO: check if it user is member of team attached to growable
    return res.status(400).send(['Growable not found']);
    // return res
    //   .status(401)
    //   .send('User not a member of team attached to growable.');
  }

  const recordedBy = req.user;
  const observation = new Observation({
    growable: growableId,
    value,
    recordedOn,
    recordedBy,
    occurredOn: occurredOn || recordedOn,
    comments,
  });
  await observation.save();

  res
    .status(201)
    .location(`/v1/observations/${growableId}/${observation.id}`)
    .send(mapToResource(observation));
};
create.requiredRole = 'member' as const;

export const remove: AppRequestHandler = async (req, res) => {
  const { id, growableId } = growableIdAndIdFromParamsValidator.validateSync(
    req.params,
  );
  const observation = await Observation.findById(id)
    .populate('growable')
    .exec();
  if (!observation) {
    return res.sendStatus(204);
  }

  if (!observation.growableDoc._organisation.equals(req.user._organisation)) {
    return res.sendStatus(403);
  }

  // TODO: check if it user is member of team attached to growable
  if (observation.growableId.equals(growableId)) {
    await deleteObservation(observation);
  }

  res.sendStatus(204);
};
remove.requiredRole = 'member' as const;
