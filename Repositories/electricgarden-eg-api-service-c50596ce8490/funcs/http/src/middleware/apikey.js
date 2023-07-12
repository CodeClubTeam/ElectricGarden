const userSchema = require('../schema/user');
const asyncHandler = require('express-async-handler');

async function getUserFromApiKey(req, res, next) {
  if (!('user' in req) && 'x-api-key' in req.headers) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey != null && apiKey.length > 4) {
      // no user yet, and API key, so look for user
      let user = await userSchema.findByApiKey(apiKey).catch(function(err) {
        // no user
        req.logger.log('No user found with API key', apiKey);
      });
      if (user != null) {
        req.userDoc = user;
        req.user = user.toObject();
      }
      next();
      return;
    }
  }
  next();
}

module.exports = asyncHandler(getUserFromApiKey);
