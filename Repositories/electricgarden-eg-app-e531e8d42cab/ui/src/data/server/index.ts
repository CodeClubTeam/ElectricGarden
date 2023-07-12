import { createServer as createRealServer } from './realServer';
import { ApiServer, CreateServer } from './shared';

export * from './shared';

// temporary until all our api calls aren't using a simple top level "import getServer"
let legacyServer: ApiServer = createRealServer(async () => '');

export const createServer: CreateServer = (getToken, options = {}) => {
    const captureForLegacyGetToken = async () => {
        const token = await getToken();
        legacyServer = createRealServer(async () => token, {
            ...options,
            orgId: options.orgId || legacyServer.getOrganisationId(),
        });
        return token;
    };
    return createRealServer(captureForLegacyGetToken, options);
};

const legacyGetServer = (orgId?: string) => {
    if (orgId) {
        legacyServer.setOrganisationId(orgId);
    }
    return legacyServer;
};

export default legacyGetServer;
