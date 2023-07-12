import { createSelector } from 'reselect';

import { AppSelector } from '../selectors';

export const createServerDataStateSelectors = <TEntity extends Entity>(
    stateSelector: AppSelector<Fetchable<TEntity>>,
) => ({
    fetchStateSelector: createSelector(
        stateSelector,
        ({ fetched, fetching }) => ({
            fetched: !!fetched,
            fetching: !!fetching,
        }),
    ),
    items: createSelector(
        stateSelector,
        (state) => Object.values(state.itemsByKey),
    ),
    itemsByKey: createSelector(
        stateSelector,
        (state) => state.itemsByKey,
    ),
});

export const makeMandatorySelector = <TResult>(
    selector: AppSelector<TResult>,
    message?: string,
) =>
    createSelector(
        selector,
        (value): Exclude<TResult, undefined | null> => {
            if (value === undefined || value === null) {
                throw new Error(message || 'Expected value to exist.');
            }
            return value as Exclude<TResult, undefined | null>;
        },
    );
