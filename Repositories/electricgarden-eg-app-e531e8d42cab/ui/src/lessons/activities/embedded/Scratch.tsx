/* <iframe
    src="https://scratch.mit.edu/projects/362943560/embed"
    allowtransparency="true"
    width="610"
    height="500"
    frameborder="1"
    scrolling="no"
    allowfullscreen
></iframe> */

import React from 'react';
import styled from 'styled-components/macro';
import { BlockContainer } from './shared';

type Props = {
    scratchId: string;
    height: string;
    title?: string;
};

const CaptionContainer = styled.div`
    text-align: center;
`;

const FrameContainer = styled.div`
    text-align: center;

    iframe {
        border: none;

        width: 650px;
    }
`;

const generateScratchUrl = (scratchId: string) =>
    `https://scratch.mit.edu/projects/${scratchId}/embed`;

export const Scratch: React.FC<Props> = ({ scratchId, height, title }) => {
    return (
        <BlockContainer>
            {title && (
                <CaptionContainer>
                    <h3>{title}</h3>
                </CaptionContainer>
            )}
            <FrameContainer>
                <iframe
                    src={generateScratchUrl(scratchId)}
                    title={title}
                    // @ts-ignore
                    allowtransparency="true"
                    width="610"
                    frameborder="1"
                    scrolling="no"
                    allowfullscreen
                    height={height}
                ></iframe>
            </FrameContainer>
        </BlockContainer>
    );
};
