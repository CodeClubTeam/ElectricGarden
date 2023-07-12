import {
    useEnsureFetched,
    EnsureFetchedProps,
    useCurrentOrganisationId,
} from '../../../hooks';

type FetchArg = { orgId: string; growableId: string };

export const useEnsureFetchedForGrowable = (
    options: Omit<EnsureFetchedProps<FetchArg>, 'fetchArg'>,
    growableId: string,
) => {
    const orgId = useCurrentOrganisationId();
    return useEnsureFetched({ ...options, fetchArg: { orgId, growableId } });
};
