import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';

import {
    currentOrganisationNameSelector,
    createAppStructuredSelector,
    growerSelector,
} from '../../selectors';
import { Role } from '../../utils';

const Container = styled.div`
    color: #939598;
    font-weight: bold;
    font-size: 1.5rem;
    padding: 0 1em;
`;

export const CurrentOrganisationName: React.FC = () => {
    const { orgName, grower } = useSelector(
        createAppStructuredSelector({
            orgName: currentOrganisationNameSelector,
            grower: growerSelector,
        }),
    );
    // don't show org name unless a super user
    if (grower.role !== Role.su) {
        return null;
    }
    return <Container>{orgName}</Container>;
};
