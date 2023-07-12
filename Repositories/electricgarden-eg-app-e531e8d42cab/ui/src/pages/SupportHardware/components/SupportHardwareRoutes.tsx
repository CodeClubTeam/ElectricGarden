import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { Hardware } from './Hardware';
import { Sensor } from './Sensor';

export const SupportHardwareRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={url} component={Hardware} />
        <Route path={`${url}/:hardwareId`} component={Sensor} />
    </>
);
