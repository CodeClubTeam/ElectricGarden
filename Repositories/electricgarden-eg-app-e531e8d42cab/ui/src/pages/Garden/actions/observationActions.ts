import { createAction, createPromiseAction } from 'redux-helper';
import getServer from '../../../data/server';

export const fetchObservationsForGrowableSucceeded = createAction<{
    growableId: string;
    observations: ServerObservation[];
}>('FETCH_OBSERVATIONS_SUCCEEDED');

export const fetchObservationsForGrowable = createPromiseAction<
    { orgId: string; growableId: string },
    ReturnType<typeof fetchObservationsForGrowableSucceeded>['payload']
>(
    'FETCH_OBSERVATIONS',
    async (params) => {
        const { orgId, growableId } = params!;
        const result = await getServer(orgId).observations.list(growableId);
        return {
            growableId,
            observations: result.items,
        };
    },
    fetchObservationsForGrowableSucceeded,
);

export const updatedOrCreatedObservation = createAction<{
    growableId: string;
    observation: ServerObservation;
}>('UPDATED_OR_CREATED_OBSERVATION');

export const removedObservation = createAction<{ growableId: string; observationId: string }>('REMOVED_OBSERVATION');