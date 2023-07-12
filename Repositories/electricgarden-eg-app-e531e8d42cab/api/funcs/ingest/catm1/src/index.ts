import { AzureFunction } from '@azure/functions';
import raygun from 'raygun';

const raygunClient = process.env.RAYGUN_API_KEY
  ? new raygun.Client().init({
      apiKey: process.env.RAYGUN_API_KEY,
      tags: ['catm1-receiver'],
    })
  : undefined;

const responseWithMessage = (status: number, message: string) => ({
  res: {
    status,
    body: { message },
  },
});

const azureFunc: AzureFunction = async function (context, req) {
  if (!req.body) {
    return responseWithMessage(400, 'Invalid request, no payload.');
  } else if (typeof req.body !== 'string') {
    return responseWithMessage(400, 'Payload not a string.');
  }

  context.log(`Received payload: "${req.body}"`);

  try {
    return responseWithMessage(301, 'New sample endpoint, get instructions');
  } catch (error) {
    if (raygunClient) {
      raygunClient.send(error);
    }
    throw error;
  }
};

module.exports = azureFunc;
