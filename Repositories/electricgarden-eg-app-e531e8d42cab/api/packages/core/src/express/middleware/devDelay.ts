import { RequestHandler } from 'express';

// let devs feel the pain
export const devDelay: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return next();
  }

  setTimeout(() => {
    next();
  }, Number(process.env.DEV_DELAY ?? 300));
};
