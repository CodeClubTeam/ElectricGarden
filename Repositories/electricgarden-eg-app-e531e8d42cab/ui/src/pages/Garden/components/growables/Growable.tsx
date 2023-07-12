import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components/macro';

import { GrowableContext } from '../../hooks';
import { growableOfSelectedTeamForIdSelectorCreate } from '../../selectors';
import { DataGraph } from '../datagraph/DataGraph';
import { Events } from '../events/Events';
import { EnsureObservationsFetched } from '../observations/EnsureObservationsFetched';
import { PhotoObservations } from '../photos/PhotoObservations';
import { GrowableHeader } from './GrowableHeader';
import { GrowableNotFound } from './GrowableNotFound';

const Container = styled.div`
    background-color: white;
    padding: 0 2em;
`;

const Dashboard = styled.div`
    display: flex;
    flex-flow: row wrap;
    margin-top: 5px;
`;

const ObservationsSection = styled.div``;

const DataGraphSection = styled.div``;

export const Growable: React.FC = () => {
    const { growableId } = useParams<{ growableId: string }>();
    const growable = useSelector(
        growableOfSelectedTeamForIdSelectorCreate(growableId),
    );
    if (!growable) {
        return <GrowableNotFound />;
    }

    return (
        <GrowableContext.Provider value={growable}>
            <Container>
                <GrowableHeader />
                <Dashboard>
                    <ObservationsSection>
                        <EnsureObservationsFetched>
                            <PhotoObservations />
                            <Events />
                        </EnsureObservationsFetched>
                    </ObservationsSection>
                    <DataGraphSection>
                        <DataGraph key={growable.id} />
                    </DataGraphSection>
                </Dashboard>
            </Container>
        </GrowableContext.Provider>
    );
};
