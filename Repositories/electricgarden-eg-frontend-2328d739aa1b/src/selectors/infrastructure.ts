import { CreatePromiseAction } from 'redux-helper';
import { createSelector } from 'reselect';

import { AppState } from '../types';

export const errorSelector = (state: AppState) => state.error.error;

const activeRequestsByTypeSelector = (state: AppState) =>
    state.asyncState.activeRequestsByType;

export const anyRequestsActiveSelectorCreator = (
    ...actionCreators: CreatePromiseAction<any, any>[]
) =>
    createSelector(
        activeRequestsByTypeSelector,
        (byType): boolean =>
            !!actionCreators.filter(({ type }) => byType[type]).length,
    );
