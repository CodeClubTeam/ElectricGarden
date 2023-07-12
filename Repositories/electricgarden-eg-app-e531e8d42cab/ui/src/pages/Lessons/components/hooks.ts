import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { useApi } from '../../../data/ApiProvider';
import * as actions from '../actions';
import { useSelectedLesson } from './content/LessonContext';

export const useStartLesson = (lesson: ServerLesson) => {
    const [inProgress, setInProgress] = React.useState(false);
    const api = useApi();
    const dispatch = useDispatch();
    const history = useHistory();
    const introSection = lesson.sections[0];
    const { setComplete: setIntroComplete } = useSectionCompletion(
        introSection.name,
    );
    return {
        inProgress,
        startLesson: () => {
            const doStartLesson = async () => {
                setInProgress(true);
                await api.lesson.start(lesson.id);
                const { items: lessons } = await api.lesson.list();
                dispatch(actions.fetchLessonsSucceeded(lessons));

                await setIntroComplete();
                setInProgress(false);
                const nextSection = lesson.sections[1];
                if (nextSection) {
                    history.push(`./${nextSection.name}`);
                }
            };
            doStartLesson().catch((err) => {
                setInProgress(false);
                throw err;
            });
        },
    };
};

export const useStopLesson = (lesson: ServerLesson) => {
    const api = useApi();
    const dispatch = useDispatch();
    return async () => {
        await api.lesson.stop(lesson.id);
        dispatch(actions.fetchLessons());
    };
};

export const useClearLessonsProgress = () => {
    const api = useApi();
    const dispatch = useDispatch();
    return async () => {
        await api.lesson.clearProgress();
        dispatch(actions.fetchLessons());
    };
};

export const useSectionCompletion = (sectionName: string) => {
    const [submitting, setSubmitting] = React.useState(false);
    const api = useApi();
    const dispatch = useDispatch();
    const { id, sections } = useSelectedLesson().lesson;
    const section = sections.find((s) => s.name === sectionName);
    if (!section) {
        throw new Error(`Section not found ${sectionName}.`);
    }

    return {
        completed: section.completed,
        submitting,
        setComplete: React.useCallback(async () => {
            try {
                setSubmitting(true);
                await api.lesson.completeSection(id, sectionName);
                const isSectionBeforeLast =
                    sections.findIndex((s) => s.name === sectionName) ===
                    sections.length - 2;
                // auto complete last section; assumes last section is a conclusion with not activities
                if (isSectionBeforeLast) {
                    const lastSection = sections[sections.length - 1];
                    await api.lesson.completeSection(id, lastSection.name);
                }
                const { items: lessons } = await api.lesson.list();
                dispatch(actions.fetchLessonsSucceeded(lessons));
            } finally {
                setSubmitting(false);
            }
        }, [api.lesson, dispatch, id, sectionName, sections]),
    };
};
