import { UserRole } from '@eg/doc-db';
import { RequestHandler } from 'express';

export interface AppRequestHandler extends RequestHandler {
  requiredRole?: UserRole;
}
