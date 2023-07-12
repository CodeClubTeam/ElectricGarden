import './style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ActionContextProvider } from './components/ActionContext';
import App from './components/App';
import { Auth0Provider } from './data/react-auth0-spa';
import { getStore } from './data/store';
import reducer from './reducer';
import { ApiProvider } from './data/ApiProvider';

const config = {
    domain: process.env.REACT_APP_AUTH0_DOMAIN!,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID!,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
};

const store = getStore(reducer);

const onRedirectCallback = (appState?: any) => {
    window.history.replaceState(
        {},
        document.title,
        appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.pathname,
    );
};

ReactDOM.render(
    <Provider store={store}>
        <Auth0Provider
            domain={config.domain}
            client_id={config.clientId}
            audience={config.audience}
            redirect_uri={window.location.origin}
            onRedirectCallback={onRedirectCallback}
        >
            <BrowserRouter>
                <ApiProvider>
                    <ActionContextProvider>
                        <App />
                    </ActionContextProvider>
                </ApiProvider>
            </BrowserRouter>
        </Auth0Provider>
    </Provider>,
    document.getElementById('root'),
);

if (module.hot) {
    module.hot.accept();
}
