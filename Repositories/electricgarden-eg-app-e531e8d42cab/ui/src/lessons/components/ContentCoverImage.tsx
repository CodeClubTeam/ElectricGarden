import React from 'react';

import { getCoverImagePath } from '../content/getCoverImage';
import styled from 'styled-components/macro';

const Placeholder = styled.span`
    display: block;
    width: 100%;
    height: 190px;
    background: grey;
`;

type Props = {
    contentPath: string;
} & React.ImgHTMLAttributes<HTMLImageElement>;

export const ContentCoverImage: React.FC<Props> = ({
    contentPath,
    ...props
}) => {
    const imagePath = getCoverImagePath(contentPath);
    if (!imagePath) {
        const { className } = props;
        return (
            <Placeholder className={className}>
                Placeholder cover image
            </Placeholder>
        );
    }

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} src={imagePath} />;
};
