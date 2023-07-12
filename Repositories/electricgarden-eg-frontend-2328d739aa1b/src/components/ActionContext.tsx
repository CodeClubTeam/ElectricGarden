import React, { useContext, useEffect, useState } from 'react';
import { connect, DispatchProp } from 'react-redux';

import { setCurrentOrganisation, setCurrentUser } from '../actions';
import { useApi } from '../data/ApiProvider';
import { useAuth0 } from '../data/react-auth0-spa';
import { HttpResponseError } from '../data/server/HttpResponseError';
import { initPages } from '../pages';
import {
    createAppStructuredSelector,
    currentOrganisationOrUndefinedSelector,
    currentUserOrNullSelector,
} from '../selectors';
import { Uninvited } from './Uninvited';

export const useActionContext = () => useContext(ActionContext);

export const ActionContext = React.createContext<{
    user?: ServerUser;
    organisation?: ServerOrganisation;
    loaded: boolean;
}>({ loaded: false });

const Provider: React.FC<Props & DispatchProp> = ({
    user,
    organisation,
    dispatch,
    children,
}) => {
    const { isAuthenticated } = useAuth0();
    const [uninvited, setUninvited] = useState(false);
    const api = useApi()!;

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        const init = async () => {
            // TODO: this is getting fired 3x. probably one of the deps is changing
            console.log('fetching initial data');
            try {
                const currentUser = await api.user.getCurrent();
                dispatch(setCurrentUser(currentUser));
                setUninvited(false);
            } catch (err) {
                if (
                    err instanceof HttpResponseError &&
                    err.response.status === 401
                ) {
                    setUninvited(true);
                }
            }

            initPages({ dispatch });
            const org = await api.organisation.getCurrent();
            dispatch(setCurrentOrganisation(org));
        };
        init().catch((err) => {
            console.error('Error fetching data from server:');
            console.error(err);
        });
    }, [isAuthenticated, dispatch, api]);
    return (
        <ActionContext.Provider
            value={{
                user: user || undefined,
                organisation,
                loaded: !!(user && organisation),
            }}
        >
            {uninvited ? <Uninvited /> : children}
        </ActionContext.Provider>
    );
};

const connector = connect(
    createAppStructuredSelector({
        user: currentUserOrNullSelector,
        organisation: currentOrganisationOrUndefinedSelector,
    }),
);

type Props = ExtractProps<typeof connector>;

export const ActionContextProvider = connector(Provider);
