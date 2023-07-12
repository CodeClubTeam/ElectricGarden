const asyncHandler = require('express-async-handler');

async function impersonateOrganisation(req, res, next) {
  if (
    'user' in req &&
    req.user.role === 'su' &&
    'x-impersonate-organisation' in req.headers
  ) {
    const newOrg = req.headers['x-impersonate-organisation'];
    req.user._trueOrganisation = req.user._organisation;
    req.user._organisation = newOrg; //TODO: Test to see if newOrg actually exists
    if ('toObject' in req.user) {
      req.userObj = req.user.toObject();
    }
  }
  next();
}

module.exports = asyncHandler(impersonateOrganisation);
