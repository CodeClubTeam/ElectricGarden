import mockServer from './mockServer';
import { createServer as createRealServer } from './realServer';
import { CreateServer, ApiServer } from './shared';

export * from './shared';

// temporary until all our api calls aren't using a simple top level "import getServer"
let legacyServer: ApiServer = process.env.REACT_APP_MOCK_SERVER
    ? mockServer
    : createRealServer(async () => '');

export const createServer: CreateServer = (getToken) => {
    /* by setting this env var you can turn mock server on and off*/
    const captureForLegacyGetToken = async () => {
        const token = await getToken();
        if (!process.env.REACT_APP_MOCK_SERVER) {
            legacyServer = createRealServer(async () => token);
        }
        return token;
    };
    return process.env.REACT_APP_MOCK_SERVER
        ? mockServer
        : createRealServer(captureForLegacyGetToken);
};

export default () => legacyServer;
