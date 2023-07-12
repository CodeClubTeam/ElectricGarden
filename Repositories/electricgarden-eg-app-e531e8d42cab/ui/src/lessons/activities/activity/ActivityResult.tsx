import React from 'react';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../../atomic-ui';
import { Result } from './state';
import styled from 'styled-components/macro';

type Props = Result & { onRetry: () => void };

const RetryIcon = () => (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path
            d="M13.91 13C13.432 15.833 10.967 18 8 18C4.692 18 2 15.308 2 12C2 8.692 4.692 6 8 6H10.172L8.086 8.086L9.5 9.5L14 5L9.5 0.5L8.086 1.914L10.172 4H8C5.87827 4 3.84344 4.84285 2.34315 6.34315C0.842855 7.84344 0 9.87827 0 12C0 14.1217 0.842855 16.1566 2.34315 17.6569C3.84344 19.1571 5.87827 20 8 20C12.08 20 15.438 16.945 15.93 13H13.91Z"
            fill="currentColor"
        />
    </svg>
);

const FailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
        <path
            d="M16 0C11.7565 0 7.68687 1.68572 4.68629 4.68632C1.68571 7.68692 0 11.7566 0 16.0001C0 20.2436 1.68571 24.3133 4.68629 27.3139C7.68687 30.3145 11.7565 32.0002 16 32.0002C20.2435 32.0002 24.3131 30.3145 27.3137 27.3139C30.3143 24.3133 32 20.2436 32 16.0001C32 11.7566 30.3143 7.68692 27.3137 4.68632C24.3131 1.68572 20.2435 0 16 0V0ZM25.1219 21.8306L21.8286 25.124L16 19.2934L10.1695 25.1221L6.87619 21.8287L12.7086 16.0001L6.8781 10.1696L10.1714 6.87814L16 12.7067L21.8305 6.87623L25.1238 10.1696L19.2914 16.0001L25.1219 21.8306Z"
            fill="currentColor"
        />
    </svg>
);

const PassContainer = styled.div`
    color: #009d00;
    svg {
        margin-right: 0.25em;
    }
`;

const FailContainer = styled.div`
    color: #ec001c;
    svg {
        margin-right: 0.25em;
    }
`;

const FeedbackContainer = styled.p`
    margin: 1.5em 0;
`;

export const ActivityResult: React.FC<Props> = ({ pass, feedback, onRetry }) =>
    pass ? (
        <PassContainer>
            <FontAwesomeIcon icon={faCheckCircle} size="2x" />
            {feedback}
        </PassContainer>
    ) : (
        <FailContainer>
            <FeedbackContainer>
                <FailIcon /> {feedback}
            </FeedbackContainer>
            <Button onClick={() => onRetry()}>
                Retry <RetryIcon />
            </Button>
        </FailContainer>
    );
