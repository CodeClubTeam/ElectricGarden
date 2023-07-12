import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../actions';
import { useApi } from '../data/ApiProvider';
import { HttpResponseError } from '../data/server/HttpResponseError';
import { growerOrUndefinedSelector } from '../selectors';
import { StartupError, StartupErrorType } from './startupErrors';

export const useActionContext = () => useContext(ActionContext);

export const ActionContext = React.createContext<{
    grower?: ServerGrower;
    loaded?: boolean;
}>({});

export const useFetchGrower = () => {
    const api = useApi();
    const dispatch = useDispatch();

    return useCallback(async () => {
        const grower = await api.grower.get();

        dispatch(actions.setGrower(grower));
    }, [api, dispatch]);
};

export const ActionContextProvider: React.FC = ({ children }) => {
    const grower = useSelector(growerOrUndefinedSelector);
    const fetchGrower = useFetchGrower();
    const dispatch = useDispatch();
    const [startupError, setStartUpError] = useState<
        StartupErrorType | undefined
    >();
    const api = useApi();
    const loaded = !!(api && grower);

    useEffect(() => {
        if (!api) {
            return;
        }
        const init = async () => {
            try {
                await fetchGrower();
                setStartUpError(undefined);
            } catch (err) {
                if (err instanceof HttpResponseError) {
                    if (err.response.status === 401) {
                        setStartUpError('NotInvited');
                        return;
                    } else if (err.response.status === 403) {
                        setStartUpError('EmailNotVerified');
                        return;
                    } else {
                        setStartUpError('ApiError');
                        console.error('Error fetching data from server:');
                        console.error(err);
                        return;
                    }
                } else if (err.message === 'Failed to fetch') {
                    setStartUpError('ApiError');
                    console.error('Error fetching data from server:');
                    console.error(err);
                    return;
                }
                throw err;
            }
        };
        init().catch((err) => {
            console.error(err);
        });
    }, [api, dispatch, fetchGrower]);

    return (
        <ActionContext.Provider
            value={{
                grower,
                loaded,
            }}
        >
            {startupError && <StartupError type={startupError} />}
            {!startupError && children}
        </ActionContext.Provider>
    );
};
