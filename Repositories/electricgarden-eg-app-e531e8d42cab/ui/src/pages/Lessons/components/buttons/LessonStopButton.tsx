import React from 'react';

import { useStopLesson } from '../hooks';

// temp. not sure if we want this yet but i wanted it for testing purposes
export const LessonStopButton: React.FC<{ lesson: ServerLesson }> = ({
    lesson,
}) => {
    const stopLesson = useStopLesson(lesson);
    const { status } = lesson;

    if (status === 'in progress') {
        return <button onClick={() => stopLesson()}>(Stop Lesson)</button>;
    }

    return null;
};
