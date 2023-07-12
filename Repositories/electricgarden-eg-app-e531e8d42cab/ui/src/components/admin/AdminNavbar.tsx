import './admin-navbar.scss';

import React from 'react';
import { NavLink, NavLinkProps, RouteComponentProps } from 'react-router-dom';

import { useCanHaveRole } from '../../hooks';
import hardwareIcon from '../../static/egdevice.svg';
import supportIcon from '../../static/fahardware.svg';
import myOrganisationIcon from '../../static/faorganisation.svg';
import teamsIcon from '../../static/fateams.svg';
import usersIcon from '../../static/fauser.svg';
import { featureSwitchedOn, Role } from '../../utils';
import { AdminHelpModal } from './AdminHelpModal';

type NavLinkItemProps = Pick<NavLinkProps, 'to' | 'exact'> & {
    label: string;
    icon: string;
    large?: boolean;
};

const NavLinkItem: React.FC<NavLinkItemProps> = ({
    exact,
    to,
    label,
    icon,
    large,
}) => (
    <div className={`nav-item ${large ? 'large-nav-item' : undefined}`}>
        <NavLink exact={exact} to={to}>
            <img src={icon} alt={label} />
            {label}
        </NavLink>
    </div>
);

// had to add alt attribute to icon image for lint rule but really this should be in CSS
export const AdminNavbar: React.FC<RouteComponentProps> = ({
    match: { path },
}) => {
    const canHaveRole = useCanHaveRole();
    return (
        <div className="nav-bar">
            <div className="nav-items">
                {canHaveRole(Role.admin) && (
                    <NavLinkItem
                        to={`${path}/users`}
                        label="Users"
                        icon={usersIcon}
                    />
                )}
                {featureSwitchedOn('teams') && canHaveRole(Role.leader) && (
                    <NavLinkItem
                        to={`${path}/teams`}
                        label="Teams"
                        icon={teamsIcon}
                    />
                )}
                {canHaveRole(Role.admin) && (
                    <NavLinkItem
                        to={`${path}/hardware`}
                        label="My Devices"
                        icon={hardwareIcon}
                    />
                )}
                {canHaveRole(Role.su) && (
                    <NavLinkItem
                        to={`${path}/support/hardware`}
                        label="Hardware Support"
                        icon={supportIcon}
                    />
                )}
                {canHaveRole(Role.admin) && (
                    <NavLinkItem
                        to={`${path}/organisation`}
                        label="My Organisation"
                        icon={myOrganisationIcon}
                    />
                )}
            </div>
            <div className="filler"></div>
            <div className="nav-footer">
                <AdminHelpModal />
            </div>
        </div>
    );
};
