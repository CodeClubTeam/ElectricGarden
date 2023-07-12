import { last } from 'lodash-es';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import { BorderedContainer } from '../../../../atomic-ui';
import { useSelectedGrowable } from '../../hooks';
import { orderedPhotoObservationsSelectorCreate as photoObservationsReverseDateOrderSelectorCreate } from '../../selectors';
import { PhotographedEvent } from '../../types';
import { OverlaidPhotoDelete } from './OverlaidPhotoDelete';
import { PhotoObservation } from './PhotoObservation';
import { PhotoObservationNavigation } from './PhotoObservationNavigation';
import { PhotoUpload } from './PhotoUpload';
import { useCanHaveRole } from '../../../../hooks';
import { Role } from '../../../../utils';

const PhotosBorderedContainer = styled(BorderedContainer)`
    --photo-container-width: 45vw;
    @media (max-width: 1023px) {
        --photo-container-width: 95vw;
    }
    width: var(--photo-container-width);

    max-width: 550px;
    background-color: ${({ theme }) => theme.bg};
`;

const MainPhotoContainer = styled.div`
    margin-bottom: 2px;
`;

export const PhotoObservations: React.FC = () => {
    const growable = useSelectedGrowable();
    const canWrite = useCanHaveRole()(Role.member);
    const observations = useSelector(
        photoObservationsReverseDateOrderSelectorCreate(growable.id),
    );
    const [selectedId, setSelectedId] = React.useState<string>();

    const handleSelected = React.useCallback(
        ({ id }: ServerObservation<PhotographedEvent>) => {
            setSelectedId(id);
        },
        [],
    );

    const selectedObservation =
        observations.find(({ id }) => id === selectedId) || last(observations);

    return (
        <div>
            <PhotosBorderedContainer>
                <MainPhotoContainer>
                    {canWrite ? (
                        <PhotoUpload growable={growable}>
                            {selectedObservation && (
                                <OverlaidPhotoDelete
                                    observation={selectedObservation}
                                />
                            )}
                            <PhotoObservation
                                observation={selectedObservation}
                            />
                        </PhotoUpload>
                    ) : (
                        <PhotoObservation
                            observation={selectedObservation}
                            readOnly
                        />
                    )}
                </MainPhotoContainer>
                <PhotoObservationNavigation
                    observations={observations}
                    onSelect={handleSelected}
                    selected={selectedObservation}
                />
            </PhotosBorderedContainer>
        </div>
    );
};
