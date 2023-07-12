import { ErrorRequestHandler } from 'express';
import * as yup from 'yup';

export const errorHandlingMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  if (err instanceof yup.ValidationError) {
    return res.status(400).send({ validationErrors: err.errors });
  }
  // error handling logic
  //req.logger.error(err);
  console.error(err);

  // pass through for raygun (next middleware) and azure to see
  next(err);
};
