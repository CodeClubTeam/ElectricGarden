import React from 'react';
import { FullPageMessage } from '../atomic-ui';
import { Link } from 'react-router-dom';

type Auth0Params = {
    email: string;
    success: boolean;
    message: string;
};

const getAuth0Params = (): Auth0Params => {
    const parts = window.location.search.substring(1).split('&');
    const result: any = {};
    for (const part of parts) {
        const [name, value] = part.split('=');
        if (name === 'success') {
            result[name] = value === 'true';
        } else {
            result[name] = decodeURIComponent(value);
        }
    }
    return result;
};

export const EmailVerified: React.FC = () => {
    const { email, success, message } = getAuth0Params();

    return (
        <FullPageMessage>
            {success && <p>{email} has been verified.</p>}
            {!success && <p>{message}</p>}
            <p>
                <Link to="/">continue to Electric Garden app</Link>.
            </p>
        </FullPageMessage>
    );
};
