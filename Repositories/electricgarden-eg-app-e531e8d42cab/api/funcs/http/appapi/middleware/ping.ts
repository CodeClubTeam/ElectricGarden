import { RequestHandler } from 'express';

export const pingMiddleware: RequestHandler = (
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next,
) => {
  if (req.path.endsWith('/ping') && req.method === 'GET') {
    res.sendStatus(200);
    return;
  }
  next();
};
