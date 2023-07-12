import React from 'react';
import styled from 'styled-components/macro';

import { formatDate, OrgMode } from '../../../utils';
import { AddressView } from './AddressView';
import { TeamIdSelector } from './TeamSelectorField';

type Props = {
    organisation: ServerOrganisation;
};

const Container = styled.dl`
    display: grid;
    grid-template-columns: 50% 50%;

    dl {
        dd {
            font-weight: 300;
        }
    }
`;

const LeftColumn = styled.dt`
    grid-column: 1;
`;

const RightColumn = styled.dt`
    grid-column: 2;
`;

export const OrganisationView: React.FC<Props> = ({
    organisation: { name, address, createdOn, defaultTeamId, mode },
}) => (
    <Container>
        <LeftColumn>
            <dl>
                <dt>Name</dt>
                <dd>{name}</dd>
                <dt>Created On</dt>
                <dd>{formatDate(createdOn)}</dd>
                <dt>Default Team</dt>
                <dd>
                    <TeamIdSelector
                        value={defaultTeamId}
                        disabled
                        unsetLabel="No default team"
                        readonly
                    />
                </dd>
                <dt>Mode</dt>
                <dd>{mode ?? OrgMode.standard}</dd>
            </dl>
        </LeftColumn>
        <RightColumn>
            <AddressView address={address} />
        </RightColumn>
    </Container>
);
