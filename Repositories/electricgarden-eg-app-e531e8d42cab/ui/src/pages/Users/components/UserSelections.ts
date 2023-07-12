import React from 'react';

type UserSelectionsContext = Readonly<{
    users: ServerUser[];
    selectedIds: string[];
    onResetSelections: () => void;
}>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const UserSelectionsContext = React.createContext<UserSelectionsContext>(
    undefined as any,
);

export const useUserSelections = () => {
    const context = React.useContext(UserSelectionsContext);
    if (!context) {
        throw new Error(`Expected UserSelectionsContext to be provided.`);
    }
    const { users, selectedIds, onResetSelections } = context;
    const selectedUsers = users.filter(({ id }) => selectedIds.includes(id));
    return {
        selectedUsers,
        onResetSelections,
    };
};
