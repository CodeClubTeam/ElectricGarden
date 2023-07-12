import * as express from 'express';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import fetch from 'node-fetch';

import { User } from '../schema/user';

const authConfig = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
};

const issuer = `https://${authConfig.domain}/`;

// Define middleware that validates incoming bearer tokens
// using JWKS from eg-devtmp.au.auth0.com
export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer,
  algorithm: ['RS256'],
});

const fetchUserDetails = (authorizationHeader: string) => {
  const requestOpts = {
    method: 'GET',
    headers: {
      Authorization: authorizationHeader, // pass on bearer token
    },
  };
  // fetch from auth0
  return fetch(`${issuer}userinfo`, requestOpts).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Error getting user info from auth0: ${res.status}, ${res.statusText}`,
      );
    }
    return res.json();
  });
};

// auth0 identity token doesn't contain user email
// and (for historical reasons) we only use email as user id
// so we need to ask auth0 to get email and then find them by email in db
// but subsequent requests we store the "sub" from the identity token in db as _authIdentityId
export const populateUserInfo: express.RequestHandler = (req, res, next) => {
  if (!(req.headers.authorization && req.user)) {
    return next();
  }

  const idToken = (req.user as unknown) as IdToken; // expressJwtSecret puts token in req.user
  User.findByAuthIdentityId(idToken.sub)
    .then((user) => {
      if (user) {
        req.user = user;
        return next();
      }
      console.info(`Requesting user details from auth0`);
      fetchUserDetails(req.headers.authorization!).then(({ email }) => {
        if (!email) {
          return next(new Error('No email address'));
        }
        console.info(`User email is ${email}`);
        User.findByEmail(email)
          .then((user) => {
            if (!user) {
              const error = 'No user found with email address';
              req.logger.log(error, email);
              res.status(401).json({ error });
              return;
            }
            req.logger.log('Found user with email address', email, user);

            // save the identity id so we don't have to ask auth0 for it next time (perf + they rate limit)
            user._authIdentityId = idToken.sub;
            return user.save().then(() => {
              req.user = user;
              return next();
            });
          })
          .catch(function(err) {
            // no user
            req.logger.log('Error finding user with email address', email, err);
            return next(err);
          });
      });
    })
    .catch((err) => {
      return next(err);
    });
};

// mostly picked from some inline middleware in src/index.js
const extractBearerToken = (req: express.Request): string | undefined => {
  if (!req.headers.authorization) {
    return undefined;
  }

  let pieces = req.headers.authorization.split(' ');

  if (!pieces || pieces.length < 2) {
    return undefined;
  }
  return pieces.slice(1).join(' ');
};
