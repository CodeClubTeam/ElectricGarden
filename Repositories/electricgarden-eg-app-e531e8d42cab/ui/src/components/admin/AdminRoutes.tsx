import React from 'react';
import {
    Route,
    Switch,
    RouteComponentProps,
    RouteProps,
    Redirect,
} from 'react-router-dom';

import { HardwareRoutes } from '../../pages/Hardware';
import { OrganisationRoutes } from '../../pages/Organisation';
import { TeamRoutes } from '../../pages/Teams';
import { UserRoutes } from '../../pages/Users';
import { SupportHardwareRoutes } from '../../pages/SupportHardware';
import { useCanHaveRole } from '../../hooks';
import { Role } from '../../utils';

const AuthRoute = ({ minRole, ...props }: { minRole: Role } & RouteProps) => {
    const canHaveRole = useCanHaveRole();
    return canHaveRole(minRole) ? <Route {...props} /> : null;
};

export const AdminRoutes: React.FC<RouteComponentProps> = ({
    match: { path },
}) => {
    const canHaveRole = useCanHaveRole();
    return (
        <Switch>
            <AuthRoute
                path={`${path}/support/hardware`}
                component={SupportHardwareRoutes}
                minRole={Role.su}
            />
            <AuthRoute
                path={`${path}/organisation`}
                component={OrganisationRoutes}
                minRole={Role.admin}
            />
            <AuthRoute
                path={`${path}/users`}
                component={UserRoutes}
                minRole={Role.admin}
            />
            <AuthRoute
                path={`${path}/hardware`}
                component={HardwareRoutes}
                minRole={Role.admin}
            />
            <AuthRoute
                path={`${path}/teams`}
                component={TeamRoutes}
                minRole={Role.leader}
            />
            <Redirect
                exact
                path={`${path}/`}
                to={
                    canHaveRole(Role.admin)
                        ? `${path}/organisation`
                        : `${path}/teams`
                }
            />
        </Switch>
    );
};
