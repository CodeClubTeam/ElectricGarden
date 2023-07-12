import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';

export type ContentLinkProps = LinkProps & {
    locked?: boolean;
};

const lockedCss = css`
    background-color: ${({ theme }) => theme.greys.mid};
    cursor: initial;
`;

// TODO: can we name these colours to pull from theme
export const ContentLink = styled(({ locked, ...props }: ContentLinkProps) => (
    <Link {...props} />
))`
    display: flex;
    flex-wrap: nowrap;
    --text-color: #3d3d3d;
    display: block;
    position: relative;
    width: var(--content-item-width);
    background-color: #2ed03c;
    border-radius: 4px;
    margin: 0.5em;
    cursor: pointer;
    padding: 3px;
    text-align: center;
    text-decoration: none;
    :hover {
        text-decoration: none;
        ${({ locked }) => (locked ? lockedCss : '')}
    }
`;
