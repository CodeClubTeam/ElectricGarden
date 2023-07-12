import React from 'react';
import { useHistory } from 'react-router-dom';

import { SubmitButton, SvgButton } from '../../../../atomic-ui';
import { LinkButton } from '../buttons/LinkButton';
import { useSectionCompletion } from '../hooks';
import { NextIcon } from '../icons';
import { useAnyIncompleteActivities } from './ActivityCompletion';
import { useSelectedLesson } from './LessonContext';

export const NextSectionButton: React.FC<{ sectionName: string }> = ({
    sectionName,
}) => {
    const history = useHistory();
    const {
        getSectionUrl,
        lesson: { sections },
    } = useSelectedLesson();
    const { completed, setComplete, submitting } = useSectionCompletion(
        sectionName,
    );
    const cannotComplete = useAnyIncompleteActivities();
    const sectionIndex = sections.findIndex(({ name }) => name === sectionName);
    const nextSection = sections[sectionIndex + 1];
    const nextSectionUrl = nextSection
        ? getSectionUrl(nextSection.name)
        : '/lessons';

    const handleSubmitClicked = React.useCallback(async () => {
        if (completed) {
            return;
        }
        await setComplete();
        history.push(nextSectionUrl);
    }, [completed, history, setComplete, nextSectionUrl]);

    if (completed) {
        return (
            <LinkButton to={nextSectionUrl}>
                <NextIcon size="4x" />
            </LinkButton>
        );
    }

    return (
        <SubmitButton
            onClick={handleSubmitClicked}
            disabled={submitting || cannotComplete}
            submitting={submitting}
            component={!submitting ? SvgButton : undefined}
        >
            <NextIcon size="4x" />
        </SubmitButton>
    );
};
