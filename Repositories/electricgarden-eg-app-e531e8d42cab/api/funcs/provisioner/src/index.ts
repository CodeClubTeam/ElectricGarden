// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv-defaults').config();
import { createHandler } from '@christensena/azure-function-express';
import { loggerMiddleware, errorHandlingMiddleware } from '@eg/core';
import bodyParser from 'body-parser';
import express from 'express';
import raygun from 'raygun';

import { basicAuthMiddleware } from './middleware';
import { api } from './routing';

const isLocal = !!process.env.LOCAL_EXPRESS_MODE;
const isTest = process.env.NODE_ENV === 'test';

const app = express();

if (isLocal) {
  // Parse json in req.body stream
  app.use(bodyParser.json());
}

app.use(loggerMiddleware);
app.use(basicAuthMiddleware);

app.use('/', api);
app.use('/api', api);
app.use('/v1', api);
app.use('/api/v1', api);

app.use(errorHandlingMiddleware); // has to come after routes to handle their errors

// important this is AFTER error handler or you get crazy 404s
if (process.env.RAYGUN_API_KEY) {
  const raygunClient = new raygun.Client().init({
    apiKey: process.env.RAYGUN_API_KEY,
    tags: ['provisioner-api'],
  });
  app.use(raygunClient.expressHandler);
}

app.all('/', (req, res) => {
  res.end('Welcome to Electric Garden Provisioning.');
});

if (isLocal && !isTest) {
  // Running locally rather than azure, so tell express to actively listen
  const port = process.env.PORT || 80;
  app.listen(port);
  console.log(`Listening on port ${port}`);
}

export const expressApp = app;

const azureFunc = createHandler(app);
export const run = azureFunc; // named entry point for azure function as it gets confused with the expressApp
export default azureFunc;
