import React from 'react';
import { useHistory } from 'react-router-dom';

import { useSectionCompletion } from '../hooks';
import { useSelectedLesson } from './LessonContext';
import styled from 'styled-components/macro';

const PositionedButton = styled.button`
    position: fixed;
    right: 300px;
    bottom: 20px;
`;

// NOTE: dev mode only
export const SectionSkipButton: React.FC<{ sectionName: string }> = ({
    sectionName,
}) => {
    const history = useHistory();
    const {
        getSectionUrl,
        lesson: { sections },
    } = useSelectedLesson();
    const { setComplete, submitting } = useSectionCompletion(sectionName);
    const sectionIndex = sections.findIndex(({ name }) => name === sectionName);
    const nextSection = sections[sectionIndex + 1];
    const nextSectionUrl = nextSection
        ? getSectionUrl(nextSection.name)
        : '/lessons';

    const handleSubmitClicked = React.useCallback(async () => {
        await setComplete();
        history.push(nextSectionUrl);
    }, [history, setComplete, nextSectionUrl]);

    return (
        <PositionedButton onClick={handleSubmitClicked} disabled={submitting}>
            (Skip Section)
        </PositionedButton>
    );
};
