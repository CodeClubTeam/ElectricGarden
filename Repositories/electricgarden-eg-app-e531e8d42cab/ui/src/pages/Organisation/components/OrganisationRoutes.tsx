import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { ensureOrganisationsFetched } from './ensureOrganisationsFetched';
import { Organisation } from './Organisation';

const Routes: React.FC<RouteComponentProps> = ({ match: { url } }) => (
    <>
        <Route exact path={`${url}/`} component={Organisation} />
    </>
);
export const OrganisationRoutes = ensureOrganisationsFetched(Routes);
