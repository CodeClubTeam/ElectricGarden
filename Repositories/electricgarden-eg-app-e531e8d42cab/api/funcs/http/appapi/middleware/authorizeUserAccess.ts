import { RequestHandler } from 'express';

export const authorizeUserAccessMiddleware: RequestHandler = (
  req,
  res,
  next,
) => {
  if (!req.user) {
    res.status(401).json({
      error: 'Invalid user - you must be logged in or have a valid API key',
    });
    return;
  }
  if (req.user.status !== 'active') {
    res.status(401).json({ error: 'User has not been activated' });
    return;
  }
  if (!req.user._organisation) {
    res.status(500).json({ error: 'Could not determine user organisation' });
    return;
  }

  next();
};
