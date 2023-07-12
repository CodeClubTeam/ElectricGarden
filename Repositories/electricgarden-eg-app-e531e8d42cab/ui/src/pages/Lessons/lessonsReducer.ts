import { createServerDataReducer } from '../../utils';
import * as actions from './actions';

export const lessonsReducer = createServerDataReducer(
    actions.fetchLessons,
    actions.fetchLessonsSucceeded,
);
