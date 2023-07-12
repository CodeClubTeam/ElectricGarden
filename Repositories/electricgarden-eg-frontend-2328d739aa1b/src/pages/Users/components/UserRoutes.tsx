import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import User from './User';
import Users from './Users';

export const UserRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={`${url}/`} component={Users} />
        <Route path={`${url}/:userId`} component={User} />
    </>
);
