import React from 'react';
import logo from '../static/eg-logo.png';
import { useAuth0 } from '../data/react-auth0-spa';

export const Uninvited: React.FC = () => {
    const { logout, user } = useAuth0();
    const { email } = user!;

    return (
        <div className="loading-container">
            <div className="loading-image-container">
                <img className="loading-image" src={logo} alt="Logo" />
            </div>
            <div className="loading-text">
                {email} has not been invited.
                <br />
                Try{' '}
                <a
                    onClick={() =>
                        logout!({
                            returnTo: window.location.origin,
                        })
                    }
                    href="/"
                >
                    logging in
                </a>{' '}
                with another email address.
            </div>
        </div>
    );
};
