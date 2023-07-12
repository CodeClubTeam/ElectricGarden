import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { ApiProvider } from '../data/ApiProvider';
import { Auth0Provider } from '../data/react-auth0-spa';
import { getStore } from '../data/store';
import reducer from '../reducer';
import { ActionContextProvider } from './ActionContext';
import { Routes } from './Routes';
import { history } from '../utils';

const config = {
    domain: process.env.REACT_APP_AUTH0_DOMAIN!,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID!,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
};

const store = getStore(reducer);

const onRedirectCallback = (appState?: any) => {
    const targetPath = appState?.path;
    if (targetPath !== window.location.pathname) {
        history.replace(targetPath);
    }
};

export const AppRoot: React.FC = () => (
    <Auth0Provider
        domain={config.domain}
        client_id={config.clientId}
        audience={config.audience}
        redirect_uri={window.location.origin}
        onRedirectCallback={onRedirectCallback}
        scope="openid email"
    >
        <ReduxProvider store={store}>
            <ApiProvider>
                <ActionContextProvider>
                    <Routes />
                </ActionContextProvider>
            </ApiProvider>
        </ReduxProvider>
    </Auth0Provider>
);
