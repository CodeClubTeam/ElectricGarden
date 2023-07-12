import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { useCurrentOrganisationMode, useCurrentUser } from '../../../../hooks';

import { lessonsSelector } from '../../selectors';
import { ClearProgressButton } from '../buttons/ClearProgressButton';
import { ensureLessonsFetched } from '../ensureLessonsFetched';
import { LessonLinkItem } from './LessonLinkItem';
import { List, ListItem } from './List';

const SuperUserActionBlock = styled.div`
    margin: 1em;
`;

const LessonListComponent: React.FC = () => {
    const lessons = useSelector(lessonsSelector);

    const mode = useCurrentOrganisationMode();
    const user = useCurrentUser();
    const canClear = mode === 'kiosk' || user.role === 'su';

    return (
        <>
            <List>
                {lessons.map((lesson) => (
                    <ListItem key={lesson.id}>
                        <LessonLinkItem lesson={lesson} />
                    </ListItem>
                ))}
            </List>
            {canClear && (
                <SuperUserActionBlock>
                    <ClearProgressButton />
                </SuperUserActionBlock>
            )}
        </>
    );
};

export const LessonList = ensureLessonsFetched(LessonListComponent);
