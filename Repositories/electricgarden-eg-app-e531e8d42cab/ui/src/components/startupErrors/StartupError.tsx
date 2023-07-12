import React from 'react';

import { ApiError } from './ApiError';
import { EmailNotVerified } from './EmailNotVerified';
import { NotInvited } from './NotInvited';

export type StartupErrorType = 'NotInvited' | 'EmailNotVerified' | 'ApiError';

type Props = {
    type: StartupErrorType;
};

export const StartupError: React.FC<Props> = ({ type }) => {
    switch (type) {
        case 'NotInvited':
            return <NotInvited />;
        case 'EmailNotVerified':
            return <EmailNotVerified />;
        case 'ApiError':
            return <ApiError />;
        default:
            return <p>Unrecognised Error.</p>;
    }
};
