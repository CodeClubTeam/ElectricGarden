import {
  Growable,
  mongoose,
  Point,
  Sensor,
  SensorDocument,
  Thing,
} from '@eg/doc-db';
import * as yup from 'yup';
import { AppRequestHandler } from '../typings';

interface SuSensorResource {
  id?: string;
  serial: string;
  friendlyName: string;
  organisationId?: string;
  readingStats?: {
    first?: Date;
    last?: Date;
    count: number;
  };
}

type SensorRecord = Pick<
  SensorDocument,
  'serial' | 'name' | 'organisationId' | 'readingStats'
> &
  Partial<Pick<SensorDocument, '_id'>>;

const mapToResource = ({
  _id,
  serial,
  name,
  organisationId,
  readingStats,
}: SensorRecord): SuSensorResource => ({
  id: _id,
  serial,
  friendlyName: name,
  organisationId,
  readingStats,
});

export const getList: AppRequestHandler = async (req, res) => {
  const sensors = await Sensor.find().exec();
  const serials = sensors.map((s) => s.serial);

  // grab any sensors not listed but listed in hardware/Thing (provisioning doesn't register them)
  const unregisteredSerials = await Thing.find()
    .where('serial')
    .exists()
    .where('serial')
    .nin(serials)
    .exec();
  const unregisteredVirtualSensors = unregisteredSerials.map(
    ({ serial }): SensorRecord => ({
      serial,
      name: '(unregistered)',
    }),
  );

  res.send([
    ...sensors.map(mapToResource),
    ...unregisteredVirtualSensors.map(mapToResource),
  ]);
};
getList.requiredRole = 'su' as const;

const serialAssignParamsValidator = yup
  .object()
  .shape({
    serial: yup.string().required('No node serial provided'),
  })
  .required();

const assignValidator = yup
  .object()
  .shape({
    name: yup.string().notRequired(),
    organisationId: yup.string().notRequired(),
    purgeReadings: yup.boolean().required(),
  })
  .required();

export const assign: AppRequestHandler = async (req, res) => {
  const { serial } = serialAssignParamsValidator.validateSync(req.params);

  const update = assignValidator.validateSync(req.body);

  const { organisationId, purgeReadings, name } = update;

  const sensor = await Sensor.findOneBySerial(serial);

  if (
    organisationId &&
    sensor &&
    !sensor._organisation?.equals(organisationId)
  ) {
    const attachedGrowables = await Growable.findBySensor(sensor)
      .populate('team')
      .exec();
    if (attachedGrowables.length > 0) {
      const growableDescrs = attachedGrowables
        .map((g) => `${g.title} (team ${g.teamDoc.name})`)
        .join(', ');
      req.logger.info(
        `Attempt to shift to ${serial} to another org with growables attached: ${growableDescrs}.`,
      );
      throw new yup.ValidationError(
        `Growables must be detached before assigning to another org. Attached growables: ${growableDescrs}.`,
        organisationId,
        'organisationId',
      );
    }
  }

  await Sensor.findOneAndUpdate(
    { serial },
    {
      _organisation: organisationId
        ? mongoose.Types.ObjectId.createFromHexString(organisationId)
        : undefined,
      name: name ?? '',
    },
    {
      strict: true,
      upsert: true,
    },
  ).exec();

  if (sensor) {
    if (organisationId) {
      req.logger.info(
        `(Re)assignment of ${serial} from org ${sensor.organisationId} to org ${organisationId} by ${req.user.email}.`,
      );
    } else {
      req.logger.info(
        `Deassignment ${serial} from ${sensor.organisationId} by ${req.user.email}.`,
      );
    }
  } else {
    req.logger.info(
      `Registered sensor ${serial} ${
        organisationId ? `to org ${organisationId}` : ''
      } by ${req.user.email}.`,
    );
  }
  if (purgeReadings) {
    const { deletedCount } = await Point.deleteMany({ nodeSerial: serial });
    req.logger.info(
      `Purged ${deletedCount} readings for node with serial ${serial}.`,
    );
  }
  res.sendStatus(204);
};
assign.requiredRole = 'su' as const;

const postValidator = yup
  .object()
  .shape({
    method: yup.string().required().oneOf(['migrate']),
    details: yup
      .object()
      .required()
      .when('method', {
        is: 'migrate',
        then: yup.object().shape({
          sourceSerial: yup
            .string()
            .required()
            .test(
              'source attached',
              'source sensor not attached to any org',
              async (serial) => {
                if (!serial) {
                  return false;
                }
                const sensor = await Sensor.findOneBySerial(serial);
                return !!(sensor && sensor._organisation);
              },
            ),
          targetSerial: yup
            .string()
            .required()
            .test(
              'target not attached',
              'target sensor already attached to an org',
              async (serial) => {
                if (!serial) {
                  return false;
                }
                const sensor = await Sensor.findOneBySerial(serial);
                return !(sensor && sensor._organisation);
              },
            ),
        }),
      }),
  })
  .required();

export const post: AppRequestHandler = async (req, res) => {
  const request = await postValidator.validate(req.body);
  switch (request.method) {
    case 'migrate': {
      const { sourceSerial, targetSerial } = request.details as {
        sourceSerial: string;
        targetSerial: string;
      };
      const sourceSensor = await Sensor.findOneBySerial(sourceSerial);
      if (!sourceSensor) {
        throw new Error('Hole in validation');
      }

      const orgId = sourceSensor._organisation;

      const targetSensor = new Sensor({
        serial: targetSerial,
        _organisation: sourceSensor._organisation,
        name: sourceSensor.name,
      });
      await targetSensor.save();

      await Growable.updateMany(
        { _organisation: orgId, sensor: sourceSensor.id },
        { sensor: targetSensor.id },
      );

      await Sensor.deleteOne({ _id: sourceSensor._id });

      await Point.updateMany(
        { nodeSerial: sourceSensor.serial },
        { nodeSerial: targetSensor.serial },
      );

      res.sendStatus(204);
      break;
    }
  }
};
post.requiredRole = 'su' as const;
