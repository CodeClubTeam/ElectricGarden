import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { Dashboard, KioskLive } from '../../pages/Dashboard';
import { GardenRoutes } from '../../pages/Garden';
import {
    LessonRoutes,
    LeaderResourcesRoutes,
    GiantsRoutes,
} from '../../pages/Lessons';

export const AppRoutes: React.FC = () => (
    <Switch>
        <Route exact path="/">
            <Redirect to="/garden" />
        </Route>
        <Route path="/garden" component={GardenRoutes} />
        <Route path="/lessons" component={LessonRoutes} />
        <Route path="/projects" component={LessonRoutes} />
        <Route path="/data" component={Dashboard} />
        <Route path="/leader-resources" component={LeaderResourcesRoutes} />
        <Route path="/giants" component={GiantsRoutes} />
        <Route path="/kiosk-live" component={KioskLive} />
    </Switch>
);
