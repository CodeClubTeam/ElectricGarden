import request, { Request } from 'supertest';

import { expressApp } from '../..';
import { getRequiredConfig } from '../../utils/util';

const apiKey = getRequiredConfig('PROVISION_API_KEY');
const apiKeyBase64 = Buffer.from(apiKey).toString('base64');

type Body = Parameters<Request['send']>[0];

export const get = (url: string) =>
  request(expressApp).get(url).set('authorization', `Basic ${apiKeyBase64}`);

export const put = (url: string, body: Body) =>
  request(expressApp)
    .put(url)
    .set('authorization', `Basic ${apiKeyBase64}`)
    .send(body);

export const del = (url: string) =>
  request(expressApp).delete(url).set('authorization', `Basic ${apiKeyBase64}`);
