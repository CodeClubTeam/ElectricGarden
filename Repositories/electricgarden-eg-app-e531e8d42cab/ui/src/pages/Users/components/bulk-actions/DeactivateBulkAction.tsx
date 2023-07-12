import React, { useCallback } from 'react';

import { ActionButton } from '../../../../atomic-ui';
import { useApi } from '../../../../data/ApiProvider';
import { Status } from '../../../../utils';
import { BulkActionProps } from './shared';

const ACTION_ID = 'deactivate';

export const DeactivateBulkAction = ({
    selectedUsers,
    inProgressActionId,
    onStarted,
    onSuccess,
    onFailure,
    onAllCompleted,
}: BulkActionProps) => {
    const api = useApi();

    const handleClick = useCallback(async () => {
        onStarted(ACTION_ID, 'Deactivate');
        const activeSelectedUsers = selectedUsers.filter(
            (u) => u.status !== Status.deactivated,
        );
        for (const user of activeSelectedUsers) {
            try {
                onSuccess(
                    await api.user.update(user.id, {
                        ...user,
                        status: Status.deactivated,
                    }),
                );
            } catch (error) {
                onFailure(user, error);
            }
        }
        onAllCompleted();
    }, [
        api.user,
        onAllCompleted,
        onFailure,
        onStarted,
        onSuccess,
        selectedUsers,
    ]);

    return (
        <ActionButton
            size="1x"
            onClick={handleClick}
            busy={inProgressActionId === ACTION_ID}
            disabled={!!inProgressActionId}
        >
            Deactivate
        </ActionButton>
    );
};
