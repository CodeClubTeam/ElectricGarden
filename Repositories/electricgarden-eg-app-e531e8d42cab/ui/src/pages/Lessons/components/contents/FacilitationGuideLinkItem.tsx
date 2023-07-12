import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { FacilitationGuide } from '../../../../lessons/components/facilitationGuides';
import { LockIcon } from '../icons';
import { ContentLink } from './ContentLink';
import { CoverImage } from './CoverImage';
import { FooterText } from './FooterText';
import { StatusIconContainer } from './StatusIconContainer';
import { TitleText } from './TitleText';

export const FacilitationGuideLinkItem: React.FC<{
    metadata: FacilitationGuide;
}> = ({ metadata: { name, contentPath, title, locked } }) => {
    const { url } = useRouteMatch();
    const path = !locked ? `${url}/${name}` : url;
    return (
        <ContentLink to={path} locked={locked}>
            <CoverImage contentPath={contentPath} />
            <TitleText>{title}</TitleText>
            {locked && <FooterText>Coming soon</FooterText>}
            {locked && (
                <StatusIconContainer>
                    <LockIcon />
                </StatusIconContainer>
            )}
        </ContentLink>
    );
};
