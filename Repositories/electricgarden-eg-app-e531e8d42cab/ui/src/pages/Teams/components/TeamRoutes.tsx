import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { ensureUsersFetched } from '../../Users';
import { ensureTeamsFetched } from './ensureTeamsFetched';
import { Team } from './Team';
import { TeamEdit } from './TeamEdit';
import { Teams } from './Teams';

const Component: React.FC<RouteComponentProps> = ({ match: { url } }) => (
    <Switch>
        <Route path={`${url}/:teamId/edit`} component={TeamEdit} />
        <Route path={`${url}/:teamId`} component={Team} />
        <Route path={`${url}/`} component={Teams} />
    </Switch>
);

export const TeamRoutes = ensureTeamsFetched(ensureUsersFetched(Component));
