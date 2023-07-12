import { createServer } from './realServer';

export type GetToken = () => Promise<string>;

export type CreateServer = typeof createServer;

export type ApiServer = ReturnType<CreateServer>;
