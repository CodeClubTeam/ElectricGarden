import { ensureFetched } from '../../../hocs/ensureFetched';
import * as actions from '../actions';
import { lessonsFetchStateSelector } from '../selectors';

export const ensureLessonsFetched = ensureFetched({
    fetchStateSelector: lessonsFetchStateSelector,
    fetch: actions.fetchLessons,
    waitMessage: 'Fetching lessons',
});
