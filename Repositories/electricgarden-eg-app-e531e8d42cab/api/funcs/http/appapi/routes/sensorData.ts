import { Context } from '@azure/functions';
import { Point, PointDocument, Sensor, SensorDocument } from '@eg/doc-db';
import { orderBy } from 'lodash';
import path from 'path';
import * as yup from 'yup';

import { getSampleData } from '../services/sampleData';
import { AppRequestHandler } from '../typings';

type DataPointResource = {
  timestamp: Date;
  readings: Partial<PointDocument['readings']>;
};

type Criteria = {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
};

type SensorDataResource = {
  sensor: {
    serial: string;
    name: string;
  };
  criteria: Criteria;
  points: DataPointResource[];
};

type SensorLike = Pick<SensorDocument, 'serial' | 'name'>;

const mapToResource = (
  { serial, name }: SensorLike,
  criteria: Criteria,
  points: PointDocument[],
): SensorDataResource => ({
  sensor: {
    serial,
    name,
  },
  criteria,
  points: points.map(({ timestampSeconds, readings }) => ({
    // why is server data strings not numbers? per timestamp seconds this is incorrect so bug potential
    timestamp: new Date(Number(timestampSeconds) * 1000),
    readings: Object.entries(readings).reduce((result, [name, value]) => {
      if (value !== undefined) {
        result[name] = typeof value === 'number' ? value : Number(value);
      }
      return result;
    }, {} as any),
  })),
});

const nodeIdFromParamsValidator = yup
  .object()
  .shape({
    nodeId: yup.string().required(),
  })
  .required();

const queryValidator = yup
  .object()
  .shape({
    startDate: yup.date(),
    endDate: yup.date(),
    limit: yup.number(),
  })
  .required();

const convertToDate = (timestamp?: Date | string): Date | undefined =>
  typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

export const getDataByNode: AppRequestHandler = async (req, res) => {
  const { nodeId } = nodeIdFromParamsValidator.validateSync(req.params);

  let sensor: SensorLike | null = await Sensor.findOneByIdOrSerialOrName(
    nodeId,
  );
  if (sensor == null) {
    if (req.user.role !== 'su') {
      return res.status(404).send({ message: 'Could not find sensor node' });
    }
    // allow data retrieval from unassigned sensors if super user
    sensor = {
      serial: nodeId,
      name: nodeId,
    };
  }
  const {
    startDate: requestedStartDate,
    endDate: requestedEndDate,
    limit,
  } = queryValidator.validateSync(req.query);

  if (sensor.serial === 'EXAMPLE') {
    const context: Context | undefined = req.context;
    const basePath = context
      ? context.executionContext.functionDirectory
      : path.resolve('./');

    const sensorDataFilePath = path.join(
      basePath,
      './static/example-sensor-data.json',
    );
    try {
      const sampleData = await getSampleData(sensorDataFilePath);
      return res.send(sampleData);
    } catch (err) {
      req.logger.error(err);
      // throw new error because crazy azure functions transmutes a file not found error
      // into a 404 status and swallows the error!?!?
      throw new Error(`Error retrieving sample data: ${err.message}`);
    }
  }

  const startDate = convertToDate(requestedStartDate);
  const endDate = convertToDate(requestedEndDate);

  let query = Point.queryBySerialAndDateRange(sensor.serial, {
    startDate,
    endDate,
  }).select('timestampSeconds readings');

  if (limit) {
    query = query.limit(limit);
  }

  const points = await query.exec();

  // sort on client because cosmos will otherwise use composite "index" which doesn't seem to perform
  // better for cosmos to use single field index on serial
  const pointsByTimestamp = orderBy(points, 'timestampSeconds');

  res.send(
    mapToResource(sensor, { startDate, endDate, limit }, pointsByTimestamp),
  );
};

const LIVE_MODE_LENGTH_MINUTES = 5;

const serialFromParamsValidator = yup
  .object()
  .shape({
    serial: yup.string().required(),
  })
  .required();

export const deleteLiveData: AppRequestHandler = async (req, res) => {
  const { serial } = serialFromParamsValidator.validateSync(req.params);

  const fromTimestampSeconds =
    Math.round(Date.now() / 1000) - LIVE_MODE_LENGTH_MINUTES * 60 * 2;
  await Point.deleteMany({
    nodeSerial: serial,
    timestampSeconds: { $gt: fromTimestampSeconds.toString() },
  });
  res.sendStatus(204);
};

// not sure where this is used? is also sensor resource not data resource
// export const getNodesFromData: AppRequestHandler = async (req, res) => {
//   const dayAgo = Date.now() / 1000 - 24 * 60 * 60;
//   const search = { _id: { $exists: true }, timestampSeconds: { $gt: dayAgo } };

//   // TODO: Figure out how to use something like distinct or aggregate

//   // const points = await pointModel.distinct('nodeSerial', search).catch(function (err) {
//   // 	console.log('Error getting sensors', err);
//   // });
//   // const points = await pointModel.aggregate([
//   //     { "$group": { "_id": "$nodeSerial" } },
//   //     // { "$skip": ( page-1 ) * 15 },
//   //     { "$limit": 15 }
//   // ])

//   const points = await Point.find(search, { nodeSerial: true })
//     .sort({ timestampSeconds: -1 })
//     .limit(1000)
//     .exec();

//   const nodeSerialSet = new Set(points.map((point) => point.nodeSerial));

//   const nodeSerialArr = Array.from(nodeSerialSet).filter(isValidSerial);
//   nodeSerialArr.sort();

//   const sensorArr = nodeSerialArr.map((nodeSerial) => ({
//     id: nodeSerial,
//     name: nodeSerial,
//     serial: nodeSerial,
//   }));

//   res.send(sensorArr);
// };
