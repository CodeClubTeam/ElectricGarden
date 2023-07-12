import React from 'react';

export type LessonContext = {
    lesson: ServerLesson;
    url: string;
    getSectionUrl: (sectionName: string) => string;
};

export const SelectedLessonContext = React.createContext<LessonContext>(
    {} as any,
);

export const useSelectedLesson = () => React.useContext(SelectedLessonContext);
