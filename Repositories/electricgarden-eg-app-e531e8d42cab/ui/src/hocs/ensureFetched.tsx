import React from 'react';

import { Loading } from '../atomic-ui';
import {
    EnsureFetchedProps,
    useEnsureFetched,
    useEnsureFetchedForOrg,
} from '../hooks/useEnsureFetched';

export type EnsureFetchedForOrgOptions = Omit<
    EnsureFetchedProps<string>,
    'fetchArg'
> & {
    waitMessage?: string;
};

export const ensureFetchedForOrg = ({
    fetchStateSelector,
    fetch,
    waitMessage,
}: EnsureFetchedForOrgOptions) => <TComponent extends React.ComponentType<any>>(
    Component: TComponent,
) => (
    props: TComponent extends React.ComponentType<infer TProps> ? TProps : any,
) => {
    const fetched = useEnsureFetchedForOrg({
        fetchStateSelector,
        fetch,
    });
    if (!fetched) {
        return <Loading message={waitMessage || 'Loading...'} />;
    }
    return <Component {...props} />;
};

export type EnsureFetchedOptions = Omit<
    EnsureFetchedProps<undefined>,
    'fetchArg'
> & {
    waitMessage?: string;
};

type ExtractProps<T> = T extends React.ComponentType<infer TProps>
    ? TProps
    : never;

export const ensureFetched = ({
    fetchStateSelector,
    fetch,
    waitMessage,
}: EnsureFetchedOptions) => <TComponent extends React.ComponentType<any>>(
    Component: TComponent,
) => (props: ExtractProps<TComponent>) => {
    const fetched = useEnsureFetched({
        fetchStateSelector,
        fetch,
        fetchArg: undefined,
    });
    if (!fetched) {
        return <Loading message={waitMessage || 'Loading...'} />;
    }
    return <Component {...props} />;
};
