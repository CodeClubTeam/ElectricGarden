import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import { PageFooter } from '../../../../atomic-ui';

import { FacilitationContent } from '../../../../lessons/components/FacilitationContent';
import { getGiantsGuideByName } from '../../../../lessons/components/giantsGuides';
import { LessonsPageHeader, LessonContentContainer } from '../layout';
import { LessonPageContent } from './LessonPageContent';

const Container = styled.div`
    --body-max-width: 1024px;
`;

export const GiantsGuide: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const guide = getGiantsGuideByName(name);
    if (!guide) {
        return <p>Not found</p>;
    }

    return (
        <Container>
            <LessonsPageHeader>
                <h1>{guide.title}</h1>
            </LessonsPageHeader>
            <LessonPageContent>
                <LessonContentContainer>
                    <FacilitationContent contentPath={guide.contentPath} />
                </LessonContentContainer>
            </LessonPageContent>
            <PageFooter />
        </Container>
    );
};
