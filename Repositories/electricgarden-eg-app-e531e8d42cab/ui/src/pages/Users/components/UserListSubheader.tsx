import React from 'react';
import styled from 'styled-components/macro';

import { BulkActions } from './bulk-actions';
import { useUserSelections } from './UserSelections';

type Props = {
    showDeactivated: boolean;
    onShowDeactivatedToggle: () => void;
};

const Container = styled.div`
    display: flex;
    margin: 5px;
`;

const FiltersContainer = styled.div`
    margin-left: auto;
    margin-right: 50px;
`;

export const UserListSubheader = ({
    showDeactivated,
    onShowDeactivatedToggle,
}: Props) => {
    const { selectedUsers } = useUserSelections();
    return (
        <Container>
            {selectedUsers.length > 0 ? <BulkActions /> : null}
            <FiltersContainer>
                <label>
                    <input
                        type="checkbox"
                        onChange={() => onShowDeactivatedToggle()}
                        checked={showDeactivated}
                    />{' '}
                    show deactivated
                </label>
            </FiltersContainer>
        </Container>
    );
};
