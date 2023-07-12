import { createServer } from './realServer';

export type ApiServer = ReturnType<typeof createServer>;

export type GetToken = () => Promise<string>;

export type CreateServer = (getToken: GetToken) => ApiServer;
