// NOTE: require('dotenv-defaults').config() has to be at top. or you will get "environment variable not found" error
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv-defaults').config();
import { createHandler } from '@christensena/azure-function-express';
import { devDelay, errorHandlingMiddleware, loggerMiddleware } from '@eg/core';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import raygun from 'raygun';

import {
  authorizeUserAccessMiddleware,
  checkJwt,
  impersonateOrganisationMiddleware,
  populateUserInfo,
  userObjMiddleware,
  pingMiddleware,
} from './middleware';
import { api } from './routing';

const localServer = process.env.LOCAL_EXPRESS_MODE === 'true';
const isTest = process.env.NODE_ENV === 'test';

const app = express();

app.use(pingMiddleware);
app.use(loggerMiddleware);
app.use(checkJwt);

if (localServer) {
  if (!isTest) {
    console.warn(`Local express mode`);
  }

  // azure functions has own cors
  app.use(cors());

  // Azure already has the body parsed
  // bodyParser.json will just hang
  // https://github.com/yvele/azure-function-express/issues/15
  app.use(bodyParser.json());

  if (!isTest) {
    // put in forced pause so devs feel the pain
    app.use(devDelay);
  }
}

app.use(populateUserInfo);
app.use(authorizeUserAccessMiddleware);
app.use(impersonateOrganisationMiddleware);
app.use(userObjMiddleware);

app.use('/v1', api);
app.use('/api/v1', api);

app.use(errorHandlingMiddleware); // has to come after routes to handle their errors

if (process.env.RAYGUN_API_KEY) {
  const raygunClient = new raygun.Client().init({
    apiKey: process.env.RAYGUN_API_KEY,
    tags: ['app-api'],
    filters: ['authorization'],
  });
  raygunClient.user = (req) => ({
    identifier: req.user?.email.replace(/.*@/, 'someone@'),
  });

  // important this is AFTER error handler or you get crazy 404s
  app.use(raygunClient.expressHandler);
} else {
  app.use(errorHandlingMiddleware); // has to come after routes to handle their errors
}

if (localServer && !isTest) {
  // Running locally rather than azure, so tell express to actively listen
  const port = process.env.PORT || 80;
  app.listen(port);
  console.log(`Listening on port ${port}`);
}

export const expressApp = app;

const azureFunc = createHandler(app);
export const run = azureFunc; // named entry point for azure function as it gets confused with the expressApp
export default azureFunc;
