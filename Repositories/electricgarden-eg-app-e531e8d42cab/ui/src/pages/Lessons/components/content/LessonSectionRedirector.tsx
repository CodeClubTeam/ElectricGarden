import React from 'react';
import { useSelectedLesson } from './LessonContext';
import { useHistory, useRouteMatch } from 'react-router-dom';

// auto select appropriate section where no section in url for lesson
export const LessonSectionRedirector = () => {
    const history = useHistory();
    const { url } = useRouteMatch();
    const { lesson } = useSelectedLesson();

    React.useEffect(() => {
        const redirectToSection = (section: ServerLessonSection) => {
            const basePath = url;
            history.replace(`${basePath}/${section.name}`);
        };

        // find first incomplete section falling back to first section or intro page
        const section =
            lesson.sections.find(({ completed }) => !completed) ??
            lesson.sections[lesson.status === 'in progress' ? 1 : 0];
        redirectToSection(section);
    }, [history, lesson.sections, lesson.status, url]);

    return null;
};
