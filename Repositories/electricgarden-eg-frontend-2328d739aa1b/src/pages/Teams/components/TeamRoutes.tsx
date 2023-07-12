import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import Team from './Team';
import Teams from './Teams';

export const TeamRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={`${url}/`} component={Teams} />
        <Route path={`${url}/:teamId`} component={Team} />
    </>
);
