import React from 'react';
import styled, { css } from 'styled-components/macro';

import { LinkButton, LinkButtonProps } from './LinkButton';

type Props = { completed: boolean; active: boolean } & LinkButtonProps;

const colorCss = css<Props>`
    ${({ disabled, theme }) => (!disabled ? theme.active : theme.inactive)};
`;

const activeCss = css`
    background: #2ed03c;

    color: white;
    :visited {
        color: white;
    }
`;

export const SectionLinkButton = styled(
    ({ completed, active, disabled, ...rest }: Props) => (
        <LinkButton {...rest} disabled={disabled} />
    ),
)`
    display: block;
    padding: 0.25em;
    margin: 0.25em;
    color: ${colorCss};
    :visited {
        color: ${colorCss};
    }
    :hover {
        text-decoration: none;
    }
    transition: all 0.5s ease-in-out;
    white-space: nowrap;
    border-radius: 5px;
    ${({ active }) => (active ? activeCss : '')};
`;
