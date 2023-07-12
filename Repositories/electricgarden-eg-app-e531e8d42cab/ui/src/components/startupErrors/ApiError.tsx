import React, { useCallback } from 'react';
import { FullPageMessage } from '../../atomic-ui';

export const ApiError: React.FC = () => {
    const handleRefresh = useCallback((e: any) => {
        e.preventDefault();
        window.location.reload();
    }, []);

    return (
        <FullPageMessage>
            <p>We're having trouble connecting to our servers.</p>
            <p>Please check your internet connection is working.</p>
            <p>
                <a onClick={handleRefresh} href="/">
                    retry
                </a>
            </p>
        </FullPageMessage>
    );
};
