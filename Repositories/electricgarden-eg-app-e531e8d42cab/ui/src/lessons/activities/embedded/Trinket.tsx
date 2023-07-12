import React from 'react';
import styled from 'styled-components/macro';
import { BlockContainer } from './shared';

type Props = {
    trinketId: string;
    height: string;
    title?: string;
    width?: string;
};

const CaptionContainer = styled.div`
    text-align: center;
`;

const FrameContainer = styled.div`
    text-align: left;
`;

const generateTrinketUrl = (trinketId: string) =>
    `https://trinket.io/embed/${trinketId}`;

export const Trinket: React.FC<Props> = ({
    trinketId,
    height,
    title,
    width = '100%',
}) => (
    <BlockContainer>
        {title && (
            <CaptionContainer>
                <h3>{title}</h3>
            </CaptionContainer>
        )}
        <FrameContainer>
            <iframe
                src={generateTrinketUrl(trinketId)}
                title={title}
                // @ts-ignore
                allowfullscreen="true"
                height={height}
                width={width}
                frameborder="0"
                marginwidth="0"
                marginheight="0"
            ></iframe>
        </FrameContainer>
    </BlockContainer>
);
