import { AzureFunction } from '@azure/functions';
import {
  deviceInactivityNotifierCreate,
  getInactiveSerialsCreate,
  getRequiredConfig,
} from '@eg/core';

const azureFunc: AzureFunction = async function ({ log }) {
  const getInactiveSerials = getInactiveSerialsCreate(
    log,
    getRequiredConfig('KIOSK_API_ENDPOINT'),
  );
  const notifyOfInactiveSerials = deviceInactivityNotifierCreate(
    log,
    getInactiveSerials,
  );

  const currentDate = new Date();
  await notifyOfInactiveSerials(currentDate);
};

module.exports = azureFunc;
