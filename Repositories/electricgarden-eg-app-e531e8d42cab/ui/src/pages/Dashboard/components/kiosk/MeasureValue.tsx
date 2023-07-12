import React from 'react';
import styled from 'styled-components/macro';

import { Measure } from '../../../../atomic-ui';

type Props = Measure;

const Container = styled(({ metric, value, ...props }: Props) => (
    <div {...props} />
))`
    background-color: ${({ metric: { color } }) => color};

    color: white;
    padding: 0.5em;

    border-radius: var(--border-radius);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    min-width: 220px;
    min-height: 50px;
`;

const ValueContainer = styled.div`
    padding: 0.25em;
    font-size: 2rem;
`;

const ValueNumberContainer = styled.span`
    font-weight: 400;
`;

const ValueSuffixContainer = styled.span`
    vertical-align: super;
    font-size: 0.25em;
`;

const LabelContainer = styled.div`
    font-size: 1rem;
    text-transform: lowercase;
    margin-top: auto;
    margin-bottom: 0;
    min-width: 5em;
`;

export const MeasureValue: React.FC<Props> = (props) => {
    const { metric, value } = props;
    const { suffix, label } = metric;
    const haveValue = value !== null;
    return (
        <Container {...props}>
            <ValueContainer>
                <ValueNumberContainer>
                    {haveValue ? value : '∞'}
                </ValueNumberContainer>
                <ValueSuffixContainer>{suffix}</ValueSuffixContainer>
            </ValueContainer>
            <LabelContainer>{label}</LabelContainer>
        </Container>
    );
};
