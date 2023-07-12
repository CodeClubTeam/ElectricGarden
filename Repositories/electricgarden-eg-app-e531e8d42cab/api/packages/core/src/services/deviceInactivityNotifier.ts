import { Logger } from '@azure/functions';
import { Point, Sensor, SensorDocument, User } from '@eg/doc-db';
import { format, subDays } from 'date-fns';
import fetch from 'node-fetch';

import { sendTemplateEmailToUser } from '../mailer';

// TODO: temp hard code; move as info into device hq
const LIVE_MODE_SERIALS = ['3HLL8FL', '3HLL8FW'];

const stripTimestamp = (date: Date) => format(date, 'yyyy-MM-dd');

export const getInactiveSerialsCreate = (
  log: Logger,
  kioskApiEndpoint: string,
) => async (dateStart: Date, dateEnd: Date): Promise<string[]> => {
  const url = `${kioskApiEndpoint}/inactive-devices?from=${stripTimestamp(
    dateStart,
  )}&to=${stripTimestamp(dateEnd)}`;
  log.info(`Requesting ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch inactive serials. Response from ${url}: Status: ${
        response.status
      } content: ${await response.text()}`,
    );
  }
  const { results } = (await response.json()) as {
    results: Array<{ serial: string }>;
  };

  return results.map(({ serial }) => serial);
};

type GetInactiveSerials = ReturnType<typeof getInactiveSerialsCreate>;

const sendInactivityNotificationEmails = async (sensor: SensorDocument) => {
  if (!sensor.organisationId) {
    throw new Error(`No organisation found for serial: ${sensor.serial}`);
  }
  const users = await User.findByOrganisation(sensor.organisationId);
  const allowedRoles = ['leader', 'admin'];
  const notifiableUsers = users.filter(
    (user) => allowedRoles.includes(user.role) && user.status === 'active',
  );
  for (const user of notifiableUsers) {
    await sendTemplateEmailToUser({
      templateName: 'eg-device-inactive',
      userId: user.id,
      mergeVars: {
        SERIAL: sensor.serial,
        SENSOR_NAME: sensor.name,
        APP_URL: 'https://app.electricgarden.nz',
      },
    });
  }
};

export const deviceInactivityNotifierCreate = (
  log: Logger,
  getInactiveSerials: GetInactiveSerials,
) => async (dateInput: Date) => {
  //If a device hasn't been heard from in at least 48 hours, trigger email
  const dateFrom = subDays(dateInput, 3);
  const dateTo = subDays(dateInput, 2);
  // const dateFrom = new Date('2020-12-01');
  // const dateTo = new Date('2020-12-19');

  //Setting time between 48 and 72 hours to only trigger once per device being inactive
  log.info('Requesting inactive serials for range', dateFrom, dateTo);
  const inactiveSerials = await getInactiveSerials(dateFrom, dateTo);
  log.info(`Got ${inactiveSerials.length} inactive serials`);

  for (const serial of inactiveSerials) {
    if (LIVE_MODE_SERIALS.includes(serial)) {
      log.info(
        `Inactive serial ${serial} is live mode (push button) sensor. Skipping.`,
      );
      continue;
    }
    const sensor = await Sensor.findOneBySerial(serial);
    if (!sensor) {
      log.info(`Inactive serial ${serial} not registered in app. Skipping.`);
      continue;
    }
    if (!sensor.organisationId) {
      log.info(`Inactive serial ${serial} not connected to any org. Skipping.`);
      continue;
    }

    // check for any samples as inactive serials based on kiosk db which is not currently
    // purged when provisioning so may have data before it gets to the customer
    // TODO: remove once consolidated sample databases
    const pointCount = await Point.find({ nodeSerial: serial })
      .limit(1)
      .countDocuments()
      .exec();
    if (pointCount === 0) {
      log.info(
        `Inactive serial ${serial} has no samples in app db. Assume purged. Skipping.`,
      );
      continue;
    }

    log(`Sending notification emails for serial ${serial}.`);
    await sendInactivityNotificationEmails(sensor);
  }
  return inactiveSerials;
};
