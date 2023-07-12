import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';

import { ProgressBar } from '../../../../atomic-ui';
import { LockIcon, TickIcon } from '../icons';
import { ContentLink, ContentLinkProps } from './ContentLink';
import { CoverImage } from './CoverImage';
import { FooterText } from './FooterText';
import { StatusIconContainer } from './StatusIconContainer';
import { TitleText } from './TitleText';

type LessonContentLinkProps = ContentLinkProps & {
    inProgress?: boolean;
};

const LessonContentLink = styled(
    ({ inProgress, ...props }: LessonContentLinkProps) => (
        <ContentLink {...props} />
    ),
)`
    background-color: ${({ inProgress }) =>
        inProgress ? `#5bdae7` : `#2ed03c`};
`;

// abs pos really just so it doesn't expand container
const ProgressBarContainer = styled.span`
    position: absolute;
    left: 1em;
    right: 1em;
    bottom: 1em;
`;

const percentCompleted = (sections: ServerLessonSection[]) => {
    const completedCount = sections.filter((s) => s.completed).length;
    return Math.round((completedCount / sections.length) * 100);
};

export const LessonLinkItem: React.FC<{
    lesson: ServerLesson;
}> = ({ lesson: { id, contentPath, title, status, sections, locked } }) => {
    const { url } = useRouteMatch();
    const path = !locked ? `${url}/${id}` : url;
    return (
        <LessonContentLink
            to={path}
            inProgress={status === 'in progress'}
            locked={locked}
        >
            <CoverImage contentPath={contentPath} />
            <TitleText>{title}</TitleText>
            {status === 'completed' && (
                <StatusIconContainer>
                    <TickIcon />
                </StatusIconContainer>
            )}
            {status === 'in progress' && (
                <ProgressBarContainer>
                    <ProgressBar
                        percent={percentCompleted(sections)}
                    ></ProgressBar>
                </ProgressBarContainer>
            )}
            {locked && <FooterText>Coming soon</FooterText>}
            {locked && (
                <StatusIconContainer>
                    <LockIcon />
                </StatusIconContainer>
            )}
        </LessonContentLink>
    );
};
