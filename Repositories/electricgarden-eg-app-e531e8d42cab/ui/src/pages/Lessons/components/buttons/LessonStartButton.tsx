import React from 'react';

import { useStartLesson } from '../hooks';
import { LaunchButton } from './LaunchButton';

export const LessonStartButton: React.FC<{ lesson: ServerLesson }> = ({
    lesson,
}) => {
    const { startLesson, inProgress } = useStartLesson(lesson);
    const { status } = lesson;

    if (!status || status === 'completed') {
        return (
            <LaunchButton
                onClick={() => startLesson()}
                status={status}
                submitting={inProgress}
            />
        );
    }

    return null;
};
