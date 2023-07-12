import { addHours, differenceInHours } from 'date-fns';
import fs from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(fs.readFile);

type DataPointResource = {
  timestamp: Date;
};

type SensorDataResource = {
  points: DataPointResource[];
};

export const getSampleData = async (sensorDataFilePath: string) => {
  const resource = JSON.parse(
    await readFileAsync(sensorDataFilePath, { encoding: 'utf-8' }),
  ) as SensorDataResource;

  const lastPoint = resource.points[resource.points.length - 1];
  if (lastPoint) {
    // massage timestamps so they are relative to today but same values within the day
    const lastTimestamp = new Date((lastPoint.timestamp as any) as string);
    const nowTimestamp = new Date();
    // using date-fns as will slow azure func start-up with bloat of momentjs
    const hoursOffset = differenceInHours(nowTimestamp, lastTimestamp);

    for (const entry of resource.points) {
      const timestamp = new Date((entry.timestamp as any) as string);
      entry.timestamp = addHours(timestamp, hoursOffset);
    }
  }

  return resource;
};
