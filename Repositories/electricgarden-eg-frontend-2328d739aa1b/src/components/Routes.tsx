import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { HardwareRoutes } from '../pages/Hardware';
import { OrganisationRoutes } from '../pages/Organisation';
import { TeamRoutes } from '../pages/Teams';
import { UserRoutes } from '../pages/Users';

export const Routes: React.FC = () => (
    <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/users" component={UserRoutes} />
        <Route path="/teams" component={TeamRoutes} />
        <Route path="/hardware" component={HardwareRoutes} />
        <Route path="/organisation" component={OrganisationRoutes} />
    </Switch>
);
