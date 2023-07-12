import rg4js from 'raygun4js';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const raygunEnabled = !!process.env.REACT_APP_RAYGUN_API_KEY;
if (raygunEnabled) {
    rg4js('apiKey', process.env.REACT_APP_RAYGUN_API_KEY || '');
    rg4js('enableCrashReporting', true);
    rg4js('enablePulse', true);
}

export const useRaygun = () => {
    const history = useHistory();
    useEffect(() => {
        if (raygunEnabled) {
            const unlisten = history.listen((location) => {
                rg4js('trackEvent', {
                    type: 'pageView',
                    path: location.pathname,
                });
            });
            return unlisten;
        }
    }, [history]);

    return {
        setUser: (user: { email: string }) => {
            const anonymisedishEmail = user.email.replace(/.*@/, 'someone@');
            rg4js('setUser', {
                identifier: anonymisedishEmail,
                email: anonymisedishEmail,
                isAnonymous: false,
            });
        },
    };
};
