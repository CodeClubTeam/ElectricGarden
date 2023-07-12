import React, { useState, useCallback } from 'react';

import { PageHeader, Section } from '../../../components/common';
import { ensureOrganisationsFetched } from '../../Organisation';
import { UserList } from './UserList';
import { UserListSubheader } from './UserListSubheader';
import { UsersHeader } from './UsersHeader';
import { UserSelectionsContext } from './UserSelections';
import { useSelector } from 'react-redux';
import { usersSummarySelector } from '../selectors';

const Users = () => {
    const users = useSelector(usersSummarySelector);
    const [showDeactivated, setShowDeactivated] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleIdSelected = useCallback(
        (selectedId: string) => {
            setSelectedIds([
                ...selectedIds.filter((id) => id !== selectedId),
                selectedId,
            ]);
        },
        [selectedIds],
    );

    const handleIdDeselected = useCallback(
        (deselectedId: string) => {
            setSelectedIds(selectedIds.filter((id) => id !== deselectedId));
        },
        [selectedIds],
    );

    const userSelectionsContext = {
        users,
        selectedIds,
        onResetSelections: () => setSelectedIds([]),
    };

    return (
        <>
            <PageHeader>
                <UsersHeader />
            </PageHeader>
            <UserSelectionsContext.Provider value={userSelectionsContext}>
                <Section
                    subheader={
                        <UserListSubheader
                            showDeactivated={showDeactivated}
                            onShowDeactivatedToggle={() =>
                                setShowDeactivated(!showDeactivated)
                            }
                        />
                    }
                >
                    <UserList
                        users={users}
                        showDeactivated={showDeactivated}
                        selectedIds={selectedIds}
                        onIdSelected={handleIdSelected}
                        onIdDeselected={handleIdDeselected}
                    />
                </Section>
            </UserSelectionsContext.Provider>
        </>
    );
};

export default ensureOrganisationsFetched(Users);
