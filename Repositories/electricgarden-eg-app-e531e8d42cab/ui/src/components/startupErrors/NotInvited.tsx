import React, { useCallback } from 'react';

import { FullPageMessage } from '../../atomic-ui';
import { useAuth0 } from '../../data/react-auth0-spa';

export const NotInvited: React.FC = () => {
    const { logout, user } = useAuth0();
    const { email } = user!;

    const handleLogout = useCallback(
        (e) => {
            e.preventDefault();
            logout!();
        },
        [logout],
    );

    return (
        <FullPageMessage>
            <p>{email} has not been invited.</p>
            <p>
                Try{' '}
                <a onClick={handleLogout} href="/">
                    logging in
                </a>{' '}
                with another email address.
            </p>
        </FullPageMessage>
    );
};
