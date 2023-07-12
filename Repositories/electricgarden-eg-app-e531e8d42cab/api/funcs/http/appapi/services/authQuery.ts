import { getRequiredConfig } from '@eg/core';
import { AppMetadata, ManagementClient, User, UserMetadata } from 'auth0';

export type AuthUser = Pick<
  User<AppMetadata, UserMetadata>,
  'email' | 'email_verified' | 'last_login' | 'logins_count' | 'created_at'
>;

// NOTE: need to set up these clientId, secret in env and set up permissions
// in Auth0 Management API Machine to Machine Applications as Authorized
// with permissions to read:users
export const getAuthUsers = async (): Promise<AuthUser[]> => {
  const auth0 = new ManagementClient({
    domain: getRequiredConfig('AUTH0_DOMAIN'),
    clientId: getRequiredConfig('AUTH0_MNGT_CLIENT_ID'),
    clientSecret: getRequiredConfig('AUTH0_MNGT_CLIENT_SECRET'),
    scope: 'read:users',
  });

  const users: AuthUser[] = [];

  let page = 0;
  const fetchMoreUsers = async () => {
    const pageUsers = await auth0.getUsers({
      page,
      fields: 'email,email_verified,last_login,logins_count,created_at',
    });
    for (const user of pageUsers) {
      users.push(user);
    }
    page += 1;
    if (pageUsers.length > 0) {
      await fetchMoreUsers();
    }
  };

  await fetchMoreUsers();

  return users;
};
