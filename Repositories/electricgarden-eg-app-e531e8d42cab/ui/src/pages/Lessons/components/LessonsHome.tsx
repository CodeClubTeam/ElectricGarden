import React from 'react';

import { PageContent, PageFooter } from '../../../atomic-ui';
import { LessonList } from './contents/LessonList';
import { ContentsContentContainer, LessonsPageHeader } from './layout';

export const LessonsHome: React.FC = () => (
    <>
        <LessonsPageHeader>
            <h1>Student Projects</h1>
        </LessonsPageHeader>
        <PageContent>
            <ContentsContentContainer>
                <LessonList />
            </ContentsContentContainer>
        </PageContent>
        <PageFooter />
    </>
);
