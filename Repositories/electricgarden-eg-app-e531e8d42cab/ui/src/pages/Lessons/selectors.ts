import { createSelector } from 'reselect';

import { AppState } from '../../types';
import { createServerDataStateSelectors } from '../../utils';

const lessonStateSelector = (state: AppState) => state.lessons;

const selectors = createServerDataStateSelectors(lessonStateSelector);

export const lessonsFetchStateSelector = selectors.fetchStateSelector;

export const lessonsSelector = selectors.items;

export const lessonsByIdSelector = selectors.itemsByKey;

export const lessonForIdSelectorCreate = (lessonId: string) =>
    createSelector(
        lessonsByIdSelector,
        (byId) => byId[lessonId],
    );
