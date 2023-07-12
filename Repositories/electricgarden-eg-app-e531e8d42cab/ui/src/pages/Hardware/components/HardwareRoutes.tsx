import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { Hardware } from './Hardware';
import { SensorDetail } from './SensorDetail';

export const HardwareRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={url} component={Hardware} />
        <Route path={`${url}/:serial`} component={SensorDetail} />
    </>
);
