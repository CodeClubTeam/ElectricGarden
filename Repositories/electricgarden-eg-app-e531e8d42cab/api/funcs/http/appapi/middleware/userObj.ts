import { RequestHandler } from 'express';

// I'm not sure what this is used for but I think some routes still depend on it
export const userObjMiddleware: RequestHandler = (req, res, next) => {
  if (req.user && req.user.toObject) {
    req.userObj = req.user.toObject();
  } else {
    req.userObj = req.user;
  }
  next();
};
