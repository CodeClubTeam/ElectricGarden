import { RequestHandler } from 'express';
import { Logger } from '@azure/functions';

export const loggerMiddleware: RequestHandler = (req, res, next) => {
  // context is azure function context
  if (req.context) {
    // in azure function context; bridge over to there
    req.logger = req.context.log;
  } else {
    // in express context; use console
    const logger: Logger = (...args: any) => {
      console.log(...args);
    };
    logger.info = console.info;
    logger.warn = console.warn;
    logger.error = console.error;
    logger.verbose = console.trace;
    req.logger = logger;
  }
  if (process.env.NODE_ENV !== 'test') {
    req.logger.info(`${req.method} ${req.url}`);
  }
  next();
};
