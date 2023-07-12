import createAuth0Client, {
    Auth0ClientOptions,
    Auth0Client,
    User,
} from '@auth0/auth0-spa-js';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { batch } from 'react-redux';
import { useRaygun } from '../hooks';

type RedirectCallback = (appState: Auth0ClientOptions) => void;

export const Auth0Context = React.createContext<{
    loading?: boolean;
    isAuthenticated?: boolean;
    user?: User;
    popupOpen?: boolean;
    loginWithPopup?: Auth0Client['loginWithPopup'];
    loginWithRedirect?: Auth0Client['loginWithRedirect'];
    getTokenSilently?: Auth0Client['getTokenSilently'];
    getTokenWithPopup?: Auth0Client['getTokenWithPopup'];
    handleRedirectCallback?: () => Promise<any>;
    logout?: Auth0Client['logout'];
}>({});

export const useAuth0 = () => useContext(Auth0Context);

// all the useCallback's are to prevent the context value changing
// which cascades to re-renders, which in the case of ActionContextProvider causes
// re-fetches of the user and org. read the docs re useCallback hook for more
export const Auth0Provider: React.FC<
    Auth0ClientOptions & {
        onRedirectCallback: RedirectCallback;
    }
> = ({ children, onRedirectCallback, ...initOptions }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>();
    const [user, setUser] = useState<User>();
    const [auth0Client, setAuth0Client] = useState<Auth0Client>();
    const [loading, setLoading] = useState(true);
    const [popupOpen, setPopupOpen] = useState(false);
    const raygun = useRaygun();

    const initAuth0 = useCallback(async () => {
        const auth0FromHook = await createAuth0Client({
            ...initOptions,
            useRefreshTokens: true,
        });
        setAuth0Client(auth0FromHook);

        if (
            window.location.search.includes('code=') &&
            window.location.search.includes('state=')
        ) {
            const { appState } = await auth0FromHook.handleRedirectCallback();
            onRedirectCallback(appState);
        }

        const isAuthenticated = await auth0FromHook.isAuthenticated();
        setIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
            const user = await auth0FromHook.getUser();
            setUser(user);
        }

        setLoading(false);
    }, [initOptions, onRedirectCallback]);

    useEffect(() => {
        initAuth0();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let unloaded = false;
        auth0Client?.getUser().then((user) => {
            if (unloaded) {
                return;
            }
            if (user?.email) {
                raygun.setUser({ email: user.email });
            }
        });

        return () => {
            unloaded = true;
        };
    }, [auth0Client, raygun]);

    const loginWithPopup = useCallback(
        async (params = {}) => {
            setPopupOpen(true);
            try {
                await auth0Client!.loginWithPopup(params);
            } catch (error) {
                console.error(error);
            } finally {
                setPopupOpen(false);
            }
            const user = await auth0Client!.getUser();
            setUser(user);
            setIsAuthenticated(true);
        },
        [auth0Client],
    );

    const handleRedirectCallback = useCallback(async () => {
        setLoading(true);
        await auth0Client!.handleRedirectCallback();
        const user = await auth0Client!.getUser();
        batch(() => {
            setLoading(false);
            setIsAuthenticated(true);
            setUser(user);
        });
    }, [auth0Client]);

    const loginWithRedirect = useCallback(
        () =>
            auth0Client!.loginWithRedirect({
                appState: {
                    path: window.location.pathname,
                },
            }),
        [auth0Client],
    );
    const getTokenSilently = useCallback(
        (...p: any[]) => auth0Client!.getTokenSilently(...p),
        [auth0Client],
    );

    const getTokenWithPopup = useCallback(
        (...p: any[]) => auth0Client!.getTokenWithPopup(...p),
        [auth0Client],
    );

    const logout = useCallback(
        () =>
            auth0Client!.logout({
                returnTo:
                    process.env.REACT_APP_LOGOUT_REDIRECT_URL ||
                    window.location.origin,
            }),
        [auth0Client],
    );

    const value = {
        isAuthenticated,
        user,
        loading,
        popupOpen,
        loginWithPopup,
        handleRedirectCallback,
        // getIdTokenClaims: (...p: any[]) =>
        //     auth0Client.getIdTokenClaims(...p),
        loginWithRedirect,
        getTokenSilently,
        getTokenWithPopup,
        logout,
    };

    return (
        <Auth0Context.Provider value={value}>{children}</Auth0Context.Provider>
    );
};
