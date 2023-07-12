import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import MediaQuery from 'react-responsive';

import { useAuth0 } from '../data/react-auth0-spa';
import AppErrorBoundary from './AppErrorBoundary';
import { Header } from './Header';
import IntercomWrapper from './IntercomWrapper';
import Navbar from './Navbar';
import { Routes } from './Routes';
import { useActionContext } from './ActionContext';

export const App: React.FC = () => {
    const { loading, isAuthenticated } = useAuth0();
    const { loaded } = useActionContext();
    if (loading) {
        return <p>Loading...</p>;
    }
    const ready = isAuthenticated && loaded;
    return (
        <div className="main">
            {!process.env.REACT_APP_INTERCOM_WRAPPER_DISABLED && ready && (
                <IntercomWrapper />
            )}
            <MediaQuery maxDeviceWidth={1024}>
                <Menu>
                    <Navbar />
                </Menu>
            </MediaQuery>
            <Header />
            <div className="body">
                <MediaQuery minDeviceWidth={1025}>
                    <Navbar />
                </MediaQuery>
                <div className="content">
                    <AppErrorBoundary>{ready && <Routes />}</AppErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default App;
