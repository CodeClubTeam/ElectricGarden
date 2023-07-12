import { LEARNER_LEVEL_DEFAULT } from '@eg/core';
import { Learner, User } from '@eg/doc-db';
import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import fetch from 'node-fetch';

/* eslint-disable require-atomic-updates */
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
  algorithms: ['RS256'],
});

const fetchUserDetails = async (authorizationHeader: string) => {
  const requestOpts = {
    method: 'GET',
    headers: {
      Authorization: authorizationHeader, // pass on bearer token
    },
  };
  // fetch from auth0
  const response = await fetch(`${issuer}userinfo`, requestOpts);
  if (!response.ok) {
    throw new Error(
      `Error getting user info from auth0: ${response.status}, ${response.statusText}`,
    );
  }
  return response.json();
};

// auth0 identity token doesn't contain user email
// and (for historical reasons) we only use email as user id
// so we need to ask auth0 to get email and then find them by email in db
// but subsequent requests we store the "sub" from the identity token in db as _authIdentityId
export const populateUserInfo: express.RequestHandler = asyncHandler(
  async (req, res, next) => {
    if (!(req.headers.authorization && req.user)) {
      return next();
    }

    const idToken = (req.user as unknown) as IdToken; // expressJwtSecret puts token in req.user
    let user = await User.findOneByAuthIdentityId(idToken.sub);
    if (user) {
      req.user = user;
      return next();
    }
    req.logger.info(
      'User not found by id token. Fetching details from auth0 for email address',
      idToken.sub,
    );
    // eslint-disable-next-line camelcase
    const { email, email_verified: emailVerified } = await fetchUserDetails(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      req.headers.authorization!,
    );
    if (!email) {
      const message = 'No email address in auth token.';
      req.logger.info(message, email);
      res.status(401).json({ type: 'NO_EMAIL', message });
      return;
    }

    user = await User.findOneByEmail(email);
    if (!user) {
      const error = 'No user found with email address.';
      req.logger.info(error, email);
      res.status(401).json({ type: 'USER_NOT_FOUND', error });
      return;
    }
    req.logger.info('Found user with email address', email, user);

    if (!emailVerified) {
      const message = 'Email not verified.';
      req.logger.info(message, email);
      res.status(403).json({ type: 'EMAIL_NOT_VERIFIED', message });
      return;
    }

    req.logger.info(
      `Verified user email is ${email}. Adding authId to database for next time.`,
    );

    // save the identity id so we don't have to ask auth0 for it next time (perf + they rate limit)
    user._authIdentityId = idToken.sub;

    // on-the-fly legacy data patch
    if (!user.learner) {
      user.learner = new Learner({ level: LEARNER_LEVEL_DEFAULT });
    }
    await user.save();
    req.user = user;
    next();
  },
);
