import { RequestHandler } from 'express';

export const basicAuthMiddleware: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  const key = process.env.PROVISION_API_KEY;
  if (key === undefined) {
    return res.status(500).send('Service is not configured with key.');
  }
  if (!auth || !auth.toLowerCase().startsWith('basic ')) {
    return res.status(401).send('No authorization');
  }
  const encodedKey = Buffer.from(key, 'ascii').toString('base64');
  if (auth.substring(6) !== encodedKey) {
    return res.status(403).send('Incorrect authorization');
  }

  next();
};
