import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { LeaderResourcesHome } from './LeaderResourcesHome';
import { FacilitationGuide } from './content/FacilitationGuide';

export const LeaderResourcesRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={`${url}/`} component={LeaderResourcesHome} />
        <Route path={`${url}/:name`} component={FacilitationGuide} />
    </>
);
