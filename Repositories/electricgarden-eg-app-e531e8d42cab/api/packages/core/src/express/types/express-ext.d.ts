declare namespace Express {
  import { UserDocument } from '@eg/doc-db';
  export interface Request {
    user: UserDocument;
  }
}
