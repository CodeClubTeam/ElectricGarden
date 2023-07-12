import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { Lesson } from './content/Lesson';
import { LessonsHome } from './LessonsHome';

export const LessonRoutes: React.FC<RouteComponentProps> = ({
    match: { url },
}) => (
    <>
        <Route exact path={`${url}/`} component={LessonsHome} />
        <Route path={`${url}/:lessonId`} component={Lesson} />
    </>
);
