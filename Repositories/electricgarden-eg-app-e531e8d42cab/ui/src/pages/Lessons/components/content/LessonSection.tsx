import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';

import { LessonStartButton } from '../buttons/LessonStartButton';
import { ActivityCompletionContextProvider } from './ActivityCompletion';
import { useSelectedLesson } from './LessonContext';
import { LessonNavigation } from './LessonNavigation';
import { NextSectionButton } from './NextSectionButton';
import { SectionContent } from './SectionContent';
import { SectionSkipButton } from './SectionSkipButton';

const Container = styled.div`
    display: flex;
`;

const SectionNavigationContainer = styled.div`
    padding-right: 2em;
`;

const BottomNav = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 1em;
    padding: 2em;
    background-color: ${({ theme }) => theme.greys.mid};
    border-radius: 4px;
`;

const NextContainer = styled.div`
    margin: 0.5em;
`;

export const LessonSection: React.FC = () => {
    const history = useHistory();
    const { url, params } = useRouteMatch<{ sectionName: string }>();
    const { lesson } = useSelectedLesson();

    const contentOpen =
        lesson.status === 'in progress' || lesson.status === 'completed';

    React.useEffect(() => {
        const redirectToSection = (section: ServerLessonSection) => {
            const basePath = url.replace(/\/[^/]+$/, '');
            history.replace(`${basePath}/${section.name}`);
        };

        const previewSection = lesson.sections[0];
        if (!contentOpen && params.sectionName !== previewSection.name) {
            // force to preview page whatever the url says if not in progress or completed
            redirectToSection(previewSection);
        }
    }, [contentOpen, history, lesson, params.sectionName, url]);

    const sectionName = params.sectionName;
    const inProgress = contentOpen && lesson.status !== 'completed';

    return (
        <ActivityCompletionContextProvider>
            <Container>
                {contentOpen && (
                    <SectionNavigationContainer>
                        <LessonNavigation activeSectionName={sectionName} />
                    </SectionNavigationContainer>
                )}
                <div>
                    <div>
                        <SectionContent
                            contentPath={lesson.contentPath}
                            sectionName={sectionName}
                        />
                    </div>
                    <BottomNav>
                        <NextContainer>
                            {inProgress && (
                                <NextSectionButton sectionName={sectionName} />
                            )}
                            {!inProgress && (
                                <LessonStartButton lesson={lesson} />
                            )}
                            {process.env.NODE_ENV !== 'production' &&
                                inProgress && (
                                    <SectionSkipButton
                                        sectionName={sectionName}
                                    />
                                )}
                        </NextContainer>
                    </BottomNav>
                </div>
            </Container>
        </ActivityCompletionContextProvider>
    );
};
