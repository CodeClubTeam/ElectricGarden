import { RequestHandler } from 'express';

// SuperUsers can impersonate things (e.g. change their organisation for a single request)
export const impersonateOrganisationMiddleware: RequestHandler = (
  req,
  res,
  next,
) => {
  if (
    !(
      req.user &&
      req.user.role === 'su' &&
      req.headers['x-impersonate-organisation']
    )
  ) {
    return next();
  }
  const impersonatedOrgId = req.headers['x-impersonate-organisation'];
  req.user._trueOrganisation = req.user._organisation;
  req.user._organisation = impersonatedOrgId; //TODO: Test to see if newOrg actually exists
  req.user.organisationId = impersonatedOrgId;
  next();
};
