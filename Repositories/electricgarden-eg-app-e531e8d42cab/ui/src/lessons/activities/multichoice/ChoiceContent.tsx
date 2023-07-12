import React from 'react';
import styled, { css } from 'styled-components/macro';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Container = styled.p`
    margin: 0;
    vertical-align: middle;
    padding: 2em 1em;
    display: flex;
    color: black;

    img {
        min-width: 200px;
    }
`;

const IconContainer = styled.span`
    min-width: 20px;
    margin: auto 0 auto 0;
    color: var(--dot-color);
`;

type Props = {
    selected: boolean;
};

const showDotCss = css`
    display: initial;
`;

const Icon = styled(({ selected, ...props }: Props) => (
    <FontAwesomeIcon icon={faCircle} {...props} />
))`
    display: none;
    ${({ selected }) => selected && showDotCss};
`;

export const ChoiceContent: React.FC<Props> = ({ children, selected }) => {
    return (
        <Container>
            <IconContainer>
                <Icon selected={selected} />
            </IconContainer>
            {children}
        </Container>
    );
};
