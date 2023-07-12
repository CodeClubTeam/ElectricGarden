import React from 'react';
import { useSelector } from 'react-redux';
import { generatePath } from 'react-router';
import { Link, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';

import { useModalTrigger } from '../../../../hooks';
import { useCanAddGrowable } from '../../hooks/permissions';
import { growablesForSelectedTeamSelector } from '../../selectors';
import { GrowableAdd } from './GrowableAdd';
import { GrowableAddButton } from './GrowableAddButton';

const NavBar = styled.ul`
    list-style-image: none;
    padding: 0;
    margin: 0;
    text-transform: uppercase;
    font-weight: 400;
    line-height: 3em;
    background-color: ${({ theme }) => theme.cover.bg};

    li:before {
        content: '|';
        font-weight: bold;
        padding: 0 0.75rem;
    }
    li:first-child:before {
        content: '';
    }
`;

const NavItem = styled.li`
    display: inline-block;
`;

const NavLink = styled(Link)`
    font-weight: ${({ to }) => (to === window.location.pathname ? 700 : 300)};

    color: ${({ theme }) => theme.greys.three};
    :visited {
        color: ${({ theme }) => theme.greys.three};
    }
`;

export const GrowableNavigation: React.FC = () => {
    const { path } = useRouteMatch();
    const growables = useSelector(growablesForSelectedTeamSelector);
    const canAdd = useCanAddGrowable();
    const { show, handleOpen, handleClose } = useModalTrigger();

    const getGrowableUrl = React.useCallback(
        (id) => generatePath(path, { growableId: id }),
        [path],
    );

    return (
        <>
            <NavBar>
                {growables.map((growable) => (
                    <NavItem key={growable.id}>
                        <NavLink to={getGrowableUrl(growable.id)}>
                            {growable.title}
                        </NavLink>
                    </NavItem>
                ))}
                {canAdd && (
                    <>
                        <NavItem>
                            <GrowableAddButton onClick={handleOpen} />
                        </NavItem>
                        <GrowableAdd show={show} onClose={handleClose} />
                    </>
                )}
            </NavBar>
        </>
    );
};
