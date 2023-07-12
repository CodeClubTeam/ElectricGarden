import { AzureFunction } from '@azure/functions';
import raygun from 'raygun';

import { receiveWebhook } from './receiveWebhook';

const raygunClient = process.env.RAYGUN_API_KEY
  ? new raygun.Client().init({
      apiKey: process.env.RAYGUN_API_KEY,
      tags: ['webhooks-stripe'],
    })
  : undefined;

const azureFunc: AzureFunction = async function (context, req) {
  const signature = req.headers['stripe-signature'];
  const rawBody = req.rawBody;
  const body = req.body;

  const handleInvalidRequest = (message = 'Invalid request.') => {
    context.log.warn(message);
    context.res = {
      status: 400,
      body: message,
    };
  };

  if (!(signature && rawBody)) {
    return handleInvalidRequest();
  }

  try {
    await receiveWebhook(
      { signature, rawBody, body },
      { onInvalidRequest: handleInvalidRequest, logger: context.log },
    );
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: 'Server error',
    };
    if (raygunClient) {
      raygunClient.send(error);
    }
    throw error;
  }
};

module.exports = azureFunc;
