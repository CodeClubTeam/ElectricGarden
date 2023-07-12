import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import { useSelectedGrowable } from '../../hooks/useSelectedGrowable';
import { eventObservationsSelectorCreate } from '../../selectors';
import { Event } from './Event';
import { EventAdd } from './EventAdd';
import { useCanHaveRole } from '../../../../hooks';
import { Role } from '../../../../utils';

const Container = styled.div``;

const List = styled.ul`
    list-style-image: none;
    padding: 0;
    background-color: rgba(91, 218, 231, 0.2);
    border: 2px solid #00a8b5;
    border-radius: 4px;
`;

const ListItem = styled.li`
    display: block;
    border-top: 1px solid #007885;
    overflow: auto;
    padding: 1em;

    :first-of-type {
        border: none;
    }
`;

const NoEvents = styled.p`
    padding-left: 2em;
`;

export const Events: React.FC = () => {
    const growable = useSelectedGrowable();
    const events = useSelector(eventObservationsSelectorCreate(growable.id));
    const canWrite = useCanHaveRole()(Role.member);
    return (
        <Container>
            {canWrite && <EventAdd />}
            <h2>Latest Events</h2>
            <List>
                {events.length > 0 &&
                    events.map((event) => (
                        <ListItem key={event.id}>
                            <Event event={event} />
                        </ListItem>
                    ))}
                {events.length === 0 && (
                    <ListItem>
                        <NoEvents>No events recorded (yet!).</NoEvents>
                    </ListItem>
                )}
            </List>
        </Container>
    );
};
