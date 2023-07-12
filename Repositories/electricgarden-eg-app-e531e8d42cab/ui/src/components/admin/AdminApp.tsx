import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import MediaQuery from 'react-responsive';
import { Route } from 'react-router-dom';
import styled from 'styled-components/macro';

import AppErrorBoundary from '../AppErrorBoundary';
import { Header } from '../header';
import { AdminNavbar } from './AdminNavbar';
import { AdminRoutes } from './AdminRoutes';
import { useAuth0 } from '../../data/react-auth0-spa';
import { Navbar } from '../app/Navbar';
import { AppRoutes } from '../app/AppRoutes';
import { BURGER_MENU_MAX_WIDTH } from '../constants';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;

    .app-content {
        flex: 1;
        overflow-y: auto;
    }

    .app-body {
        display: flex;
        height: 100%;
    }
`;

const NavContainer = styled.div`
    --body-max-width: 1366px;
    background-color: ${({ theme }) => theme.cover.bg};
    min-width: fit-content;
`;

export const AdminApp: React.FC<{ children: React.ReactNode }> = () => {
    const { isAuthenticated } = useAuth0();
    return (
        <NavContainer>
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
            <Container>
                <MediaQuery maxDeviceWidth={1024}>
                    <Menu>
                        <Route component={AdminNavbar} />
                    </Menu>
                </MediaQuery>
                <div className="app-body">
                    <MediaQuery minDeviceWidth={1025}>
                        <Route component={AdminNavbar} />
                    </MediaQuery>
                    <div className="app-content">
                        <AppErrorBoundary>
                            {isAuthenticated && (
                                <Route component={AdminRoutes} />
                            )}
                        </AppErrorBoundary>
                    </div>
                </div>
            </Container>
        </NavContainer>
    );
};
