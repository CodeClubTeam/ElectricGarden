import { createAction, createPromiseAction } from 'redux-helper';
import getServer from '../../data/server';

export const fetchLessonsSucceeded = createAction<ServerLesson[]>(
    'FETCH_LESSONS_SUCCEEDED',
);

export const fetchLessons = createPromiseAction<
    {},
    ReturnType<typeof fetchLessonsSucceeded>['payload']
>(
    'FETCH_LESSONS',
    async () => {
        const result = await getServer().lesson.list();
        return result.items;
    },
    fetchLessonsSucceeded,
);
