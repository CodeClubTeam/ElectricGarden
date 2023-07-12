import { createServerDataReducer } from '../../../utils';
import * as actions from '../actions';

export const growablesReducer = createServerDataReducer(
    actions.fetchGrowables,
    actions.fetchGrowablesSucceeded,
    {
        updatedOrCreatedAction: actions.updatedOrCreatedGrowable,
        deletedAction: actions.removedGrowable,
    },
);
