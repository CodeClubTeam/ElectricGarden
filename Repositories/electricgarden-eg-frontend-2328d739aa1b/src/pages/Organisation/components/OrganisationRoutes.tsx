import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import Organisation from './Organisation';

export const OrganisationRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={`${url}/`} component={Organisation} />
    </>
);
