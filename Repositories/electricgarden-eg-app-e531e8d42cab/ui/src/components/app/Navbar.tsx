import {
    faCarrot,
    faChalkboardTeacher,
    faLaptopCode,
    faLightbulb,
    faTachometerAlt,
    faTools,
    IconDefinition,
    faAward,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link, LinkProps, matchPath } from 'react-router-dom';
import styled from 'styled-components/macro';

import { useCanHaveRole, useCurrentOrganisationMode } from '../../hooks';
import { featureSwitchedOn, Role } from '../../utils';

const Container = styled.div`
    background-color: ${({ theme }) => theme.active};
    position: sticky;
    top: 0px;
    z-index: 1;
`;

const NavList = styled.ul`
    list-style-image: none;
    max-width: var(--body-max-width);
    margin: 0 auto;
    padding-left: 0.5em;

    font-size: 2.25rem;
    color: white;

    li {
        padding: 0 0.75em;
    }

    li:first-of-type {
        padding-left: 0;
    }

    li:last-of-type {
        padding-right: 0;
    }
`;

const NavListItem = styled.li`
    display: inline-block;
`;

// this would be easier with emotion for css as you can create a classname from css
// and then we could use NavLink
const ColouredNavLink = styled(Link)`
    display: block;
    padding: 10px 0;
    --color: ${({ to }) =>
        matchPath(window.location.pathname, {
            path: typeof to === 'string' ? to : '',
            exact: typeof to === 'string' && to === '/',
        })
            ? '#FFF200'
            : 'white'};
    color: var(--color);
    font-size: 1.5rem;
    :visited,
    :hover {
        color: var(--color);
        text-decoration: none;
    }
`;

const LinkText = styled.span`
    padding-left: 0.4em;
`;

type NavListItemLinkProps = Pick<LinkProps, 'to'> & {
    label: string;
    icon: IconDefinition;
    customIcon?: string;
};

// as any on to below becuase it broke randomly. some issue with typescript it would seem
const NavListItemLink: React.FC<NavListItemLinkProps> = ({
    to,
    label,
    icon,
    customIcon,
}) => (
    <NavListItem>
        <ColouredNavLink to={to as any}>
            {customIcon ? (
                <img src={customIcon} alt={label} />
            ) : (
                <FontAwesomeIcon icon={icon} />
            )}
            <LinkText>{label}</LinkText>
        </ColouredNavLink>
    </NavListItem>
);

export const Navbar: React.FC = () => {
    const canHaveRole = useCanHaveRole();
    const mode = useCurrentOrganisationMode();

    return (
        <Container>
            <NavList>
                {featureSwitchedOn('garden') && (
                    <NavListItemLink
                        to="/garden"
                        label="Our Garden"
                        icon={faCarrot}
                    />
                )}
                {featureSwitchedOn('lessons') && (
                    <NavListItemLink
                        to="/projects"
                        label="Students"
                        icon={faLaptopCode}
                    />
                )}
                {featureSwitchedOn('lessons') && canHaveRole(Role.leader) && (
                    <NavListItemLink
                        to="/leader-resources"
                        label="Teachers"
                        icon={faChalkboardTeacher}
                    />
                )}
                {featureSwitchedOn('lessons') && canHaveRole(Role.leader) && (
                    <NavListItemLink
                        to="/giants"
                        label="GIANTS"
                        icon={faAward}
                    />
                )}
                {canHaveRole(Role.member) && (
                    <NavListItemLink
                        to="/data"
                        label="Data Graph"
                        icon={faTachometerAlt}
                    />
                )}
                {canHaveRole(Role.leader) && (
                    <NavListItemLink
                        to="/admin"
                        label="Settings"
                        icon={faTools}
                    />
                )}
                {mode === 'kiosk' && (
                    <NavListItemLink
                        to="/kiosk-live"
                        label="Live"
                        icon={faLightbulb}
                    />
                )}
            </NavList>
        </Container>
    );
};
