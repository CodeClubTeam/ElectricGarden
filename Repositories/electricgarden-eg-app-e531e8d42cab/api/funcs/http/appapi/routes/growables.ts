import {
  Growable,
  GrowableDocument,
  Sensor,
  Team,
  Observation,
  GrowableType,
  GrowableTypeDocument,
} from '@eg/doc-db';
import * as yup from 'yup';

import { AppRequestHandler } from '../typings';
import { deleteObservation } from '../services/observationsService';

// NOTE: instead of limiting changes to leader role
// we could limit them to team members
// but we would need to resolve the user's team
// and limit member role to one team
// and require leader role to choose a team
// something like that. more complicated so start with this

interface GrowableResource {
  id: string;
  title: string;
  teamId: string;
  sensorId: string;
  type: {
    id: string;
    name: string;
    title: string;
    observables: string[];
  };
  notes?: string;
  soilType?: string;
  createdOn: Date;
}

const mapType = ({
  id,
  name,
  title,
  observables,
}: GrowableTypeDocument): GrowableResource['type'] => ({
  id,
  name,
  title,
  observables: [...observables],
});

const mapToResource = ({
  id,
  title,
  teamId,
  sensorId,
  typeDoc,
  notes,
  soilType,
  createdOn,
}: GrowableDocument): GrowableResource => ({
  id,
  title,
  teamId,
  sensorId,
  type: mapType(typeDoc),
  notes,
  soilType,
  createdOn,
});

const growableIdFromParamsValidator = yup
  .object()
  .shape({
    growableId: yup.string().required(),
  })
  .required();

const resolveTeam = async (teamId: string) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new yup.ValidationError(
      `Team not found with id: ${teamId}`,
      teamId,
      'teamId',
    );
  }
  return team;
};

const resolveSensor = async (sensorId: string) => {
  const sensor = await Sensor.findById(sensorId);
  if (!sensor) {
    throw new yup.ValidationError(
      `Sensor not found with id: ${sensorId}`,
      sensorId,
      'sensorId',
    );
  }
  return sensor;
};

const resolveType = async (typeId: string) => {
  const type = await GrowableType.findById(typeId);
  if (!type) {
    throw new yup.ValidationError(
      `Growable type not found with id: ${typeId}`,
      typeId,
      'typeId',
    );
  }
  return type;
};

const teamIdFromQueryValidator = yup
  .object()
  .shape({
    teamId: yup.string().notRequired(),
  })
  .required();

export const getSingleById: AppRequestHandler = async (req, res) => {
  const { growableId } = growableIdFromParamsValidator.validateSync(req.params);

  const growable = await Growable.findOneById(growableId);
  if (!growable) {
    return res.sendStatus(404);
  }
  res.send(mapToResource(growable));
};

export const getList: AppRequestHandler = async (req, res) => {
  let growables: GrowableDocument[];
  const { teamId } = teamIdFromQueryValidator.validateSync(req.query);

  if (teamId) {
    growables = await Growable.findByOrganisationTeam(
      req.user.organisationId,
      teamId,
    );
  } else {
    growables = await Growable.findByOrganisation(req.user.organisationId);
  }
  res.send(growables.map(mapToResource));
};

const createGrowableValidator = yup
  .object()
  .shape({
    title: yup.string().required(),
    teamId: yup.string().required(),
    sensorId: yup.string().required(),
    typeId: yup.string().required(),
    notes: yup.string(),
    soilType: yup.string(),
  })
  .required();

export const create: AppRequestHandler = async (req, res) => {
  const {
    title,
    teamId,
    sensorId,
    typeId,
    notes,
    soilType,
  } = await createGrowableValidator.validate(req.body);
  const organisationId = req.user.organisationId;

  const growable = new Growable({
    _organisation: organisationId,
    title,
    team: await resolveTeam(teamId),
    sensor: await resolveSensor(sensorId),
    growableType: await resolveType(typeId),
    notes,
    soilType,
  });
  await growable.save();

  res
    .status(201)
    .location(`/v1/growables/${growable.id}`)
    .send(mapToResource(growable));
};
create.requiredRole = 'leader' as const;

const updateGrowableValidator = yup
  .object()
  .strict(true)
  .shape({
    title: yup.string(),
    teamId: yup.string(),
    sensorId: yup.string(),
    notes: yup.string(),
    soilType: yup.string(),
  })
  .required();

export const update: AppRequestHandler = async (req, res) => {
  const { growableId } = growableIdFromParamsValidator.validateSync(req.params);
  const {
    title,
    teamId,
    sensorId,
    notes,
    soilType,
  } = await updateGrowableValidator.validate(req.body);

  const organisationId = req.user.organisationId;

  const growable = await Growable.findOneById(growableId);
  if (!growable) {
    return res.status(412).send('Can only update existing resource with PUT.');
  }
  if (!growable._organisation.equals(organisationId)) {
    return res.sendStatus(403);
  }

  if (title) {
    growable.title = title;
  }
  if (teamId) {
    growable.team = await resolveTeam(teamId);
  }
  if (sensorId) {
    growable.sensor = await resolveSensor(sensorId);
  }
  if (notes !== undefined) {
    growable.notes = notes;
  }
  if (soilType !== undefined) {
    growable.soilType = soilType;
  }

  await growable.save();

  res.status(200).send(mapToResource(growable));
};
update.requiredRole = 'leader' as const;

export const remove: AppRequestHandler = async (req, res) => {
  const { growableId } = growableIdFromParamsValidator.validateSync(req.params);

  const observations = await Observation.findByGrowableId(growableId);
  await Promise.all(observations.map(deleteObservation));
  await Growable.deleteOne({ _id: growableId });

  return res.sendStatus(204);
};
remove.requiredRole = 'leader' as const;
