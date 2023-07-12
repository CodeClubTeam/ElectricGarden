import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { GiantsGuide } from '../../../../lessons/components/giantsGuides';
import { LockIcon } from '../icons';
import { ContentLink } from './ContentLink';
import { CoverImage } from './CoverImage';
import { FooterText } from './FooterText';
import { StatusIconContainer } from './StatusIconContainer';
import { TitleText } from './TitleText';
import { SubTitleText } from './SubTitleText';

export const GiantsGuideLinkItem: React.FC<{
    metadata: GiantsGuide;
}> = ({ metadata: { name, contentPath, title, locked } }) => {
    const { url } = useRouteMatch();
    const path = !locked ? `${url}/${name}` : url;
    return (
        <ContentLink to={path} locked={locked}>
            <CoverImage contentPath={contentPath} />
            <SubTitleText>
                {title.split('-')[0]}
                {'\n'}
            </SubTitleText>
            <TitleText>{title.split('-')[1]}</TitleText>
            {locked && <FooterText>Coming soon</FooterText>}
            {locked && (
                <StatusIconContainer>
                    <LockIcon />
                </StatusIconContainer>
            )}
        </ContentLink>
    );
};
