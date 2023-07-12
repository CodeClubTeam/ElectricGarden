import React from 'react';
import styled from 'styled-components/macro';

import { Button } from '../../../../atomic-ui';
import { useModalTrigger } from '../../../../hooks';
import { GrowableAdd } from '../growables/GrowableAdd';

const Container = styled.div`
    max-width: 30em;
    margin: 4em auto;
`;

const ActionButtonContainer = styled.div`
    text-align: center;
`;

const Prelim = styled.div`
    p {
        font-weight: 300;
        font-size: 1.1rem;
        text-transform: lowercase;
        color: #3d3d3d;
        text-align: center;
    }
`;

export const GrowablesIntroAdd: React.FC = () => {
    const { show, handleOpen, handleClose } = useModalTrigger();

    return (
        <Container>
            <Prelim>
                <p>
                    Haven't planted yet?
                    <br /> You can still get your garden started.
                </p>
            </Prelim>
            <ActionButtonContainer>
                <Button onClick={handleOpen}>Create your first garden</Button>
            </ActionButtonContainer>
            <GrowableAdd show={show} onClose={handleClose} />
        </Container>
    );
};
