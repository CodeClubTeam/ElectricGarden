import React from 'react';

import { Loading } from '../../../../atomic-ui';
import * as actions from '../../actions';
import { useEnsureFetchedForGrowable } from '../../hooks';
import { useSelectedGrowable } from '../../hooks/useSelectedGrowable';
import { observationsForGrowableFetchStateSelectorCreate } from '../../selectors';

export const EnsureObservationsFetched: React.FC = ({ children }) => {
    const growable = useSelectedGrowable();
    const fetched = useEnsureFetchedForGrowable(
        {
            fetchStateSelector: observationsForGrowableFetchStateSelectorCreate(
                growable.id,
            ),
            fetch: actions.fetchObservationsForGrowable,
        },
        growable.id,
    );
    if (!fetched) {
        return <Loading message={'Fetching observations...'} />;
    }
    return <>{children}</>;
};
