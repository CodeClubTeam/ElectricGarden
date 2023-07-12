import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppSelector } from '../selectors';
import { useCurrentOrganisationId } from './useCurrentOrganisationId';

// don't support an object as fetcharg atm as it messes with useEffect deps working properly
type FetchArg = string | number | object | undefined;

export type EnsureFetchedProps<TFetchArg extends FetchArg = undefined> = {
    fetchStateSelector: AppSelector<{ fetched: boolean; fetching: boolean }>;
    fetch: (arg: TFetchArg) => void;
    fetchArg: TFetchArg;
};

export const useEnsureFetched = <TFetchArg extends FetchArg = undefined>({
    fetchStateSelector,
    fetch,
    fetchArg,
}: EnsureFetchedProps<TFetchArg>) => {
    const { fetched, fetching } = useSelector(fetchStateSelector);
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (!fetched && !fetching) {
            dispatch(fetch(fetchArg));
        }
    }, [dispatch, fetch, fetchArg, fetched, fetching]);

    return fetched;
};

export const useEnsureFetchedForOrg = (
    options: Omit<EnsureFetchedProps<string>, 'fetchArg'>,
) => {
    const organisationId = useCurrentOrganisationId();
    return useEnsureFetched({ ...options, fetchArg: organisationId });
};
