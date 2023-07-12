require('dotenv').config();
import { Point, Sensor, PointDocument } from '@eg/doc-db';

const DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getTimestamp = ({ timestampSeconds }: Pick<PointDocument, "timestampSeconds">) => new Date(Number(timestampSeconds) * 1000);

async function run() {
  console.log('Reading sensors');
  const sensors = await Sensor.find({ serial: { $ne: 'EXAMPLE' } });
  console.log(`Found ${sensors.length} sensors.`);

  let processed = 0;

  for (const sensor of sensors) {
    const { serial } = sensor;

    const pointsByTimestamp = await Point.find({ nodeSerial: serial })
      .select('timestampSeconds')
      .sort('timestampSeconds')
      .exec();
    const timestamps = pointsByTimestamp.map(getTimestamp);

    if (timestamps.length > 0) {
      sensor.readingStats = {
        first: timestamps[0],
        last: timestamps[timestamps.length - 1],
        count: timestamps.length,
      };
      try {
        if (!sensor.name) {
          sensor.name = sensor.serial;
        }
        await sensor.save();
        console.log(`${serial}: %o`, sensor.readingStats);
      } catch (err) {
        console.error(
          `Failed to save summary data for sensor with serial: ${serial}`,
        );
        console.error(err);
      }
    } else {
      if (sensor.readingStats) {
        sensor.readingStats = {
          first: undefined,
          last: undefined,
          count: 0,
        };
        try {
          await sensor.save();
        } catch (err) {
          console.error(
            `Failed to clear summary data for sensor with serial: ${serial}`,
          );
          console.error(err);
        }
      }
      console.log(`${serial} no readings found`);
    }

    processed += 1;
    console.log(
      `Sleeping for ${DELAY_MS} ms, then doing ${processed} of ${sensors.length}`,
    );
    await sleep(DELAY_MS);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Unhandled error.');
  console.error(err);
  process.exit(1);
});
