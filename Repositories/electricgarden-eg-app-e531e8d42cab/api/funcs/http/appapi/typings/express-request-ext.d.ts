// copy/pasta from @eg/core not sure why needs to be inline
import { Context, Logger } from '@azure/functions';

declare module 'http' {
  interface IncomingMessage {
    context?: Context; // only exists when running inside an azure function
    logger: Logger;
  }
}
