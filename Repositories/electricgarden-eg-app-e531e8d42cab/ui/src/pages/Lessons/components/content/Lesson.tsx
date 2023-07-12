import React from 'react';
import { useSelector } from 'react-redux';
import { Route, RouteComponentProps, Switch } from 'react-router';

import { PageFooter } from '../../../../atomic-ui';
import { useCurrentOrganisationMode } from '../../../../hooks';
import { lessonForIdSelectorCreate } from '../../selectors';
import { ClearProgressButton } from '../buttons/ClearProgressButton';
import { LessonStopButton } from '../buttons/LessonStopButton';
import { ensureLessonsFetched } from '../ensureLessonsFetched';
import { LessonContentContainer, LessonsPageHeader } from '../layout';
import { LessonContext, SelectedLessonContext } from './LessonContext';
import { LessonPageContent } from './LessonPageContent';
import { LessonSection } from './LessonSection';
import { LessonSectionRedirector } from './LessonSectionRedirector';

type Props = RouteComponentProps<{ lessonId: string }>;

const LessonComponent: React.FC<Props> = ({ match: { params, url } }) => {
    const lesson = useSelector(lessonForIdSelectorCreate(params.lessonId));
    const mode = useCurrentOrganisationMode();
    const lessonContext: LessonContext = {
        lesson,
        url,
        getSectionUrl: (sectionName) => `${url}/${sectionName}`,
    };

    return (
        <SelectedLessonContext.Provider value={lessonContext}>
            <LessonsPageHeader>
                <h1>{lesson.title}</h1>
            </LessonsPageHeader>
            <LessonPageContent>
                <LessonContentContainer>
                    <>
                        <Switch>
                            <Route
                                path={`${url}/:sectionName`}
                                component={LessonSection}
                            />
                            <Route
                                path={url}
                                component={LessonSectionRedirector}
                            />
                        </Switch>
                        {mode === 'kiosk' && <ClearProgressButton />}
                        {process.env.NODE_ENV !== 'production' && (
                            <LessonStopButton lesson={lesson} />
                        )}
                    </>
                    <PageFooter />
                </LessonContentContainer>
            </LessonPageContent>
        </SelectedLessonContext.Provider>
    );
};

export const Lesson = ensureLessonsFetched(LessonComponent);
