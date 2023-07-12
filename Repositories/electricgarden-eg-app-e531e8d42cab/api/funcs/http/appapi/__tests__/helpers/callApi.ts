import request, { Request } from 'supertest';

import { expressApp } from '../../server';
import { getAuthToken } from './getAuthToken';
import { TestUserName, defaultUser } from '@eg/test-support';

type Body = Parameters<Request['send']>[0];

const createApi = (accessToken: string, orgId?: string) => {
  const req = request(expressApp); // .;
  const addHeaders = (r: request.Test) => {
    const result = r.set('authorization', `Bearer ${accessToken}`);
    if (orgId) {
      return result.set('x-impersonate-organisation', orgId);
    }
    return result;
  };
  return {
    get: async (url: string) => addHeaders(req.get(`/api/v1/${url}`)),
    delete: async (url: string) => addHeaders(req.delete(`/api/v1/${url}`)),
    put: async (url: string, body: Body) =>
      addHeaders(req.put(`/api/v1/${url}`)).send(body),
    post: async (url: string, body: Body) =>
      addHeaders(req.post(`/api/v1/${url}`)).send(body),
    patch: async (url: string, body: Body) =>
      addHeaders(req.patch(`/api/v1/${url}`)).send(body),
  };
};

export const createApiForUser = async ({
  user,
  impersonateOrgId: orgId,
}: {
  user?: TestUserName;
  impersonateOrgId?: string;
} = {}) => {
  const accessToken = await getAuthToken(user || defaultUser);
  // TODO: set up authId in user record
  return createApi(accessToken, orgId);
};

export type UserApi = ReturnType<typeof createApi>;
