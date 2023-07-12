import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components/macro';

import { IconButton, TinyButton, ConfirmDialog } from '../../../../atomic-ui';
import { useObservationDeleteHandler, useSelectedGrowable } from '../../hooks';
import { PhotographedEvent } from '../../types';

type Props = {
    observation: ServerObservation<PhotographedEvent>;
};

const Container = styled.div`
    position: relative;
`;

const ButtonContainer = styled(TinyButton)`
    position: absolute;
    right: 0.5em;
    top: 0.5em;
    color: ${({ theme }) => theme.btn.primary.fg};
    cursor: pointer;

    :hover {
        color: ${({ theme }) => theme.btn.primary.bg};
    }
`;

export const OverlaidPhotoDelete: React.FC<Props> = ({ observation }) => {
    const growable = useSelectedGrowable();
    const { handleDelete, deleting } = useObservationDeleteHandler(
        growable,
        observation,
    );
    return (
        <Container>
            <ButtonContainer>
                <ConfirmDialog
                    header="Confirm deletion"
                    body={
                        <p>
                            Are you sure you want to delete this photo
                            observation?
                        </p>
                    }
                    onConfirm={handleDelete}
                >
                    <IconButton
                        onClick={handleDelete}
                        submitting={deleting}
                        size="2x"
                    >
                        <FontAwesomeIcon icon={faTrashAlt} size="2x" />
                    </IconButton>
                </ConfirmDialog>
            </ButtonContainer>
        </Container>
    );
};
