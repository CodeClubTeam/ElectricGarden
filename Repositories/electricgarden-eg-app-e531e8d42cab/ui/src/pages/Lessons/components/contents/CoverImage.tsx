import React from 'react';
import styled from 'styled-components/macro';

import { ContentCoverImage } from '../../../../lessons/components/ContentCoverImage';

type Props = {
    contentPath: string;
};

const StyledCoverImage = styled(ContentCoverImage)`
    width: 100%;
    border-radius: 4px;
`;

export const CoverImage: React.FC<Props> = ({ contentPath }) => (
    <StyledCoverImage contentPath={contentPath} />
);
