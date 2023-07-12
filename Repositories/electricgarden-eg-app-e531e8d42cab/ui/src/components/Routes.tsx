import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { FullPageLoading } from '../atomic-ui';
import { useAuth0 } from '../data/react-auth0-spa';
import { useRaygun } from '../hooks';
import { useActionContext } from './ActionContext';
import { AdminApp } from './admin/AdminApp';
import { App } from './app/App';

export const Routes: React.FC = () => {
    useRaygun();
    const { loading } = useAuth0();
    const { loaded } = useActionContext();
    if (!(loaded && !loading)) {
        return <FullPageLoading />;
    }
    return (
        <Switch>
            <Route path="/admin" component={AdminApp} />
            <Route path="/" component={App} />
        </Switch>
    );
};
