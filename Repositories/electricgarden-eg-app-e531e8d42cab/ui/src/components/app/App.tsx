import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import MediaQuery from 'react-responsive';
import styled from 'styled-components/macro';

import { useAuth0 } from '../../data/react-auth0-spa';
import { Header } from '../header';
import { AppRoutes } from './AppRoutes';
import { Navbar } from './Navbar';
import { BURGER_MENU_MAX_WIDTH } from '../constants';
import { KioskManagement } from './kiosk/KioskManagement';
import { useCurrentUserIsKiosk } from '../../hooks';

const Container = styled.div`
    --body-max-width: 1366px;
    background-color: ${({ theme }) => theme.cover.bg};
    min-width: fit-content;
`;

export const App: React.FC = () => {
    const { isAuthenticated } = useAuth0();
    const kioskRole = useCurrentUserIsKiosk();
    return (
        <Container>
            {kioskRole && <KioskManagement />}
            <MediaQuery maxDeviceWidth={BURGER_MENU_MAX_WIDTH}>
                <Menu>
                    <Navbar />
                </Menu>
            </MediaQuery>
            <Header />
            <MediaQuery minDeviceWidth={BURGER_MENU_MAX_WIDTH + 1}>
                <Navbar />
            </MediaQuery>
            {isAuthenticated && <AppRoutes />}
        </Container>
    );
};
