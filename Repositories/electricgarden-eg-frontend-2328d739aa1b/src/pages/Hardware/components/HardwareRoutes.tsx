import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import Hardware from './Hardware';
import Sensor from './Sensor';

export const HardwareRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route path={`${url}/:hardwareId`} component={Sensor} />
        <Route path={`${url}`} component={Hardware} />
    </>
);
