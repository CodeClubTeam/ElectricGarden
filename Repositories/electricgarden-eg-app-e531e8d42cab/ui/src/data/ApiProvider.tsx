import React, { useContext, useMemo, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { StartupError } from '../components/startupErrors';
import { useAuth0 } from './react-auth0-spa';
import { ApiServer, createServer } from './server';
import * as actions from '../actions';
import {
    HttpResponseError,
    HttpValidationResponseError,
} from './server/HttpResponseError';
import { useCurrentOrganisationIdOrUndefined } from '../hooks';
import { FullPageLoading } from '../atomic-ui';
import { useHistory } from 'react-router-dom';

export const ApiContext = React.createContext<ApiServer>(
    (undefined as any) as ApiServer,
);

export const useApi = () => useContext(ApiContext);

export const ApiProvider: React.FC = ({ children }) => {
    const {
        loading,
        isAuthenticated,
        getTokenSilently,
        user,
        loginWithRedirect,
    } = useAuth0();

    const dispatch = useDispatch();

    const onHttpError = useCallback(
        (httpError: HttpResponseError) => {
            if (httpError instanceof HttpValidationResponseError) {
                dispatch(actions.httpValidationError(httpError));
            } else {
                dispatch(actions.httpError(httpError));
            }
        },
        [dispatch],
    );

    const orgId = useCurrentOrganisationIdOrUndefined();

    // turns out that if you don't do this useMemo thing
    // then the context value changes and this causes re-renders and then re-fetches down the line
    const server = useMemo(
        () =>
            isAuthenticated && getTokenSilently
                ? createServer(() => getTokenSilently(), { onHttpError, orgId })
                : undefined,
        [getTokenSilently, isAuthenticated, onHttpError, orgId],
    );

    const history = useHistory();

    const emailNotVerified = user && !user.email_verified;

    useEffect(() => {
        if (emailNotVerified && history.location.search.includes('code=')) {
            history.replace(history.location.pathname);
        }
    }, [emailNotVerified, history]);

    if (!loading && !isAuthenticated) {
        loginWithRedirect!();
        return null;
    }

    if (!user || !server) {
        return <FullPageLoading />;
    }

    return (
        <ApiContext.Provider value={server}>
            {emailNotVerified && <StartupError type="EmailNotVerified" />}
            {!emailNotVerified && children}
        </ApiContext.Provider>
    );
};
