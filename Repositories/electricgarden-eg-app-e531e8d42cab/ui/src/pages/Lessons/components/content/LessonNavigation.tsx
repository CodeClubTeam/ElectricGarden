import React from 'react';
import styled from 'styled-components/macro';

import { SectionLinkButton } from '../buttons/SectionLinkButton';
import { LightningIcon, NextIcon } from '../icons';
import { useSelectedLesson } from './LessonContext';

const List = styled.ul`
    list-style-image: none;
    padding: 0;
    margin: 0;
`;

const ListItem = styled.li`
    list-style-type: none;
`;

type Props = { disabled?: boolean; activeSectionName: string };

export const LessonNavigation: React.FC<Props> = ({
    disabled,
    activeSectionName,
}) => {
    const {
        lesson: { sections },
        getSectionUrl,
    } = useSelectedLesson();

    const canBeNavigatedTo = (section: ServerLessonSection) => {
        const index = sections.indexOf(section);
        const firstIncompleteIndex = sections.findIndex(
            ({ completed }) => !completed,
        );
        return (
            !disabled && (section.completed || index === firstIncompleteIndex)
        );
    };

    const isActive = (section: ServerLessonSection) =>
        activeSectionName === section.name;

    return (
        <List>
            {sections.map((section) => (
                <ListItem key={section.name}>
                    <SectionLinkButton
                        disabled={!canBeNavigatedTo(section)}
                        title={section.title}
                        to={getSectionUrl(section.name)}
                        completed={section.completed}
                        active={isActive(section)}
                    >
                        {isActive(section) ? (
                            <LightningIcon />
                        ) : (
                            <NextIcon size="1x" rotation={90} />
                        )}{' '}
                        {section.title}
                    </SectionLinkButton>
                </ListItem>
            ))}
        </List>
    );
};
