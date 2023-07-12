declare namespace Express {
  import { UserDocument } from '@eg/doc-db';
  export interface Request {
    user: UserDocument;
    userObj: any;
  }
}

interface IdToken {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}
