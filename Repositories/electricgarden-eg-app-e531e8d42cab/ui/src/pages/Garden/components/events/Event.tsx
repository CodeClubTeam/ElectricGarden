import React from 'react';
import styled from 'styled-components/macro';

import { formatFriendlyDateTime } from '../../../../utils';
import { EventObservation } from '../../types';
import { getEventTypeTitle } from '../../selectors';
import { getDisplayComponent } from './getEventComponent';
import { iconByEventType } from '../eventIcons';

type Props = {
    event: ServerObservation<EventObservation>;
};

const Container = styled.div`
    display: grid;
    grid-template-columns: 60px 15em auto;
    padding-left: 0.5em;
`;

const IconContainer = styled.div`
    grid-column: 1;
    margin: auto auto;
    min-width: 40px;
`;

const SummaryContainer = styled.div`
    grid-column: 2;
    padding-left: 1em;
`;

const TypeTitle = styled.p`
    font-size: 1.5rem;
    color: #3d3d3d;
    margin: 0.25em 0;
`;

const TimestampTitle = styled.p`
    font-size: 1rem;
    line-height: 1rem;
    font-weight: 300;
    margin: 0.5em 0;
`;

const ValueDisplay = styled.div`
    grid-column: 3;
    margin: auto 0;
    font-weight: 300;
    font-size: 0.8rem;
`;

export const Event: React.FC<Props> = ({ event: { occurredOn, value } }) => {
    const DisplayComponent = getDisplayComponent(value.type);
    const SvgIcon = iconByEventType[value.type];
    return (
        <Container>
            <IconContainer>{SvgIcon && <SvgIcon />}</IconContainer>
            <SummaryContainer>
                <TypeTitle>{getEventTypeTitle(value.type)}</TypeTitle>
                <TimestampTitle>
                    {formatFriendlyDateTime(occurredOn)}
                </TimestampTitle>
            </SummaryContainer>
            <ValueDisplay>
                <DisplayComponent value={value} />
            </ValueDisplay>
        </Container>
    );
};
