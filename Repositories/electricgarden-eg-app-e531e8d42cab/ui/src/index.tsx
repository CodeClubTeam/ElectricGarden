import './style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components/macro';

import { AppRoot } from './components/AppRoot';
import { EmailVerified } from './components/EmailVerified';
import { theme } from './theme';
import { history } from './utils';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

ReactDOM.render(
    <Router history={history}>
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <Switch>
                    <Route path="/email-verified" component={EmailVerified} />
                    <Route component={AppRoot} />
                </Switch>
            </QueryClientProvider>
        </ThemeProvider>
    </Router>,
    document.getElementById('root'),
);

if (module.hot) {
    module.hot.accept();
}
