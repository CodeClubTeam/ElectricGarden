import React from 'react';
import styled from 'styled-components/macro';
import { Card, Accordion } from 'react-bootstrap';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
    heading: React.ReactNode;
};

const HeadingBlockContainer = styled.div`
    display: flex;
`;
const HeadingContainer = styled.div`
    padding: 0.25em;
    font-size: 18px;
    font-style: italic;
`;

const CaretContainer = styled.div`
    margin-left: auto;
`;

const ContentContainer = styled.div`
    padding: 0.5em;
    margin: 0.5em;
    font-size: 16px;
`;

export const CollapsablePanel: React.FC<Props> = ({ children, heading}) => {
    const [expanded, setExpanded] = React.useState(false);
    return (
        <Accordion>
            <Card style={{width: '650px'}}>
                <Accordion.Toggle
                    eventKey="0"
                    as={Card.Header}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(!expanded)}
                >
                    <HeadingBlockContainer>
                        <HeadingContainer>{heading}</HeadingContainer>
                        <CaretContainer>
                            <FontAwesomeIcon
                                icon={expanded ? faCaretUp : faCaretDown}
                                size="3x"
                            />
                        </CaretContainer>
                    </HeadingBlockContainer>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <ContentContainer>{children}</ContentContainer>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};
