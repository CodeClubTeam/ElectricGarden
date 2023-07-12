import { AzureFunction, HttpRequest } from '@azure/functions';
import { Sensor } from '@eg/doc-db';
import { notifyForGoldilocksZones } from '@eg/core';
import raygun from 'raygun';
import * as yup from 'yup';
import { mapSampleToPoint } from './mapSampleToPoint';
import { sampleValidator } from './sampleValidator';

const raygunClient = process.env.RAYGUN_API_KEY
  ? new raygun.Client().init({
      apiKey: process.env.RAYGUN_API_KEY,
      tags: ['sample-receiver'],
    })
  : undefined;

const responseWithBody = (status: number, body: unknown = null) => ({
  res: {
    status,
    body, // weirdly if only one prop it treats it as body so need body: null
  },
});

const azureFunc: AzureFunction = async function ({ log }, req: HttpRequest) {
  const { serial } = req.params;
  try {
    if (!serial) {
      return responseWithBody(400, { message: 'Serial expected in route.' });
    }
    log(`Received sample for ${serial}.`);

    const sample = sampleValidator.validateSync(req.body);

    const point = mapSampleToPoint(serial, sample);
    await point.save();
    log(`Success inserting sample for ${serial}: "${JSON.stringify(sample)}"`);

    let sensor = await Sensor.findOneBySerial(serial);
    if (!sensor) {
      sensor = new Sensor({
        serial,
      });
      log(`Registering sensor serial: ${serial}.`);
    }
    sensor.updateStatsForReading();
    await sensor.save();

    await notifyForGoldilocksZones(serial, sample);

    return responseWithBody(204);
  } catch (error) {
    log.error(
      `Failed to insert sample for ${serial}: ${JSON.stringify(error)}`,
    );
    if (error instanceof yup.ValidationError) {
      return responseWithBody(400, { validationErrors: error.errors });
    }
    if (raygunClient) {
      raygunClient.send(error);
    }
    throw error;
  }
};

module.exports = azureFunc;
