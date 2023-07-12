import React from 'react';
import styled from 'styled-components/macro';

import { TeamQuickAdd } from '../../../Teams';

const Container = styled.div`
    margin: 4em auto;
    max-width: 40em;
    text-align: center;
`;

export const NoTeamCanCreate: React.FC = () => {
    return (
        <Container>
            <TeamQuickAdd hideValidationErrors />
        </Container>
    );
};
