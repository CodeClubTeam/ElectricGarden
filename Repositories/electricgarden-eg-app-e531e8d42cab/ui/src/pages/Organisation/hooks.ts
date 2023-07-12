import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../data/ApiProvider';
import { useFetchGrower } from '../../components/ActionContext';

export const useTeams = () => {
    const [fetchStatus, setFetchStatus] = useState<
        'fetching' | 'fetched' | undefined
    >();
    const [values, setValues] = useState<ServerTeam[]>([]);

    const api = useApi();
    useEffect(() => {
        if (fetchStatus === undefined) {
            setFetchStatus('fetching');
            api.team.list().then((teams) => {
                setFetchStatus('fetched');
                setValues(teams.items);
            });
        }
    }, [api, fetchStatus]);

    return { fetching: fetchStatus !== 'fetched', values };
};

export const useOrganisationSwitch = () => {
    const api = useApi();
    const fetchGrower = useFetchGrower();

    return {
        setOrganisationId: useCallback(
            async (organisationId: string) => {
                api.setOrganisationId(organisationId);
                await fetchGrower();
            },
            [api, fetchGrower],
        ),
    };
};
