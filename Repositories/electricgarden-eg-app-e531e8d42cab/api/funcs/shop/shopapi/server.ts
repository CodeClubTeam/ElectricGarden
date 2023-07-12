// NOTE: require('dotenv-defaults').config() has to be at top. or you will get "environment variable not found" error
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv-defaults').config();
import { createHandler } from '@christensena/azure-function-express';
import { loggerMiddleware, errorHandlingMiddleware, devDelay } from '@eg/core';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';
import raygun from 'raygun';

import { api } from './routing';

const localServer = process.env.LOCAL_EXPRESS_MODE === 'true';
const isTest = process.env.NODE_ENV === 'test';

const app = express();
app.use(cors());
app.use(loggerMiddleware);

if (localServer) {
  // Azure already has the body parsed
  // bodyParser.json will just hang
  // https://github.com/yvele/azure-function-express/issues/15
  // NOTE: there might be an issue with webhook reception and checking the signing as we need the raw request for that.
  // req.rawBody should have it, but there is some issues on good for this.
  app.use(bodyParser.raw());
  app.use(
    bodyParser.json({
      verify: (req, res, buf, encoding) => {
        // Add req.rawBody for when we are working inside express.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.rawBody = buf.toString(encoding ? encoding : 'utf-8');
      },
    }),
  );

  // TODO remove once integrated with UI.
  app.use('/example', express.static(path.join(__dirname, 'htmlExamples')));

  if (!isTest) {
    // put in forced pause so devs feel the pain
    app.use(devDelay);
  }
}

app.use('/v1', api);
app.use('/api/v1', api);
app.use(errorHandlingMiddleware); // has to come after routes to handle their errors

if (process.env.RAYGUN_API_KEY) {
  const raygunClient = new raygun.Client().init({
    apiKey: process.env.RAYGUN_API_KEY,
    tags: ['shop-api'],
  });
  app.use(raygunClient.expressHandler as any);
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
