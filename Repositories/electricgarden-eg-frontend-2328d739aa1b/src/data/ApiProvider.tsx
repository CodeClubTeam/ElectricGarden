import React, { useContext } from 'react';

import { useAuth0 } from './react-auth0-spa';
import { ApiServer, createServer } from './server';

export const ApiContext = React.createContext<ApiServer | undefined>(undefined);

export const useApi = () => useContext(ApiContext);

export const ApiProvider: React.FC = ({ children }) => {
    const { getTokenSilently } = useAuth0();

    const getToken = () => getTokenSilently!();

    return (
        <ApiContext.Provider value={createServer(getToken)}>
            {children}
        </ApiContext.Provider>
    );
};
