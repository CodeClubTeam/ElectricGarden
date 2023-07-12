declare namespace Express {
  type Log = (...args: any[]) => void;
  export interface Request {
    logger: {
      log: Log;
      info: Log;
      warn: Log;
      error: Log;
    };
    user?: UserModel;
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
