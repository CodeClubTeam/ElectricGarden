import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { GiantsGuide } from './content/GiantsGuide';
import { GiantsHome } from './GiantsHome';

export const GiantsRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={`${url}/`} component={GiantsHome} />
        <Route path={`${url}/:name`} component={GiantsGuide} />
    </>
);
