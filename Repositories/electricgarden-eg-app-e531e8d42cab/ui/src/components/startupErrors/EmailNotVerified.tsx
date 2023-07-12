import React, { useCallback } from 'react';

import { FullPageMessage } from '../../atomic-ui';
import { useAuth0 } from '../../data/react-auth0-spa';

export const EmailNotVerified: React.FC = () => {
    const { user } = useAuth0();
    const { email } = user!;

    const handleRefresh = useCallback((e: any) => {
        e.preventDefault();
        window.location.reload();
    }, []);

    return (
        <FullPageMessage>
            <p>{email} has not been verified.</p>
            <p>
                Click the link in the verification email sent to you then{' '}
                <a onClick={handleRefresh} href="/">
                    refresh
                </a>{' '}
                this page.
            </p>
        </FullPageMessage>
    );
};
