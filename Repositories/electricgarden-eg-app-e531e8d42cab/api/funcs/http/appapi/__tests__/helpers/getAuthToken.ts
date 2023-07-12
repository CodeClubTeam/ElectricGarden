/* eslint-disable camelcase */
import { getRequiredConfig } from '@eg/core';
import { memoize } from 'lodash';
import fetch from 'node-fetch';

import { testUsers } from '@eg/test-support';

// NOTE: this is set up for real on the Development auth0 application only
//
// If recreating or running on another application or auth0 tenant you will need to:
// a) enable Password grant type for this to work (advanced settings on the application)
// b) specify default connection on tenant settings to Username-Password-Authentication
// see https://community.auth0.com/t/how-to-authorize-user-with-email-password-from-server-code/7239

export const getAuthToken = memoize(
  async (name: keyof typeof testUsers) => {
    const { email: username, password } = testUsers[name];

    const json = {
      client_id: getRequiredConfig('AUTH0_CLIENT_ID'),
      client_secret: getRequiredConfig('AUTH0_CLIENT_SECRET'),
      audience: getRequiredConfig('AUTH0_AUDIENCE'),
      grant_type: 'password',
      username,
      password,
      scope: 'openid',
    };
    const response = await fetch(
      `https://${getRequiredConfig('AUTH0_DOMAIN')}/oauth/token`,
      {
        headers: { 'content-type': 'application/json' },
        method: 'post',
        body: JSON.stringify(json),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Error authenticating. ${response.status} ${JSON.stringify(
          await response.json(),
        )}`,
      );
    }
    const body = await response.json();
    const token = body['access_token'];
    if (!token) {
      throw new Error('no access token returned');
    }
    return token;
  },
  (name: string) => name,
);
