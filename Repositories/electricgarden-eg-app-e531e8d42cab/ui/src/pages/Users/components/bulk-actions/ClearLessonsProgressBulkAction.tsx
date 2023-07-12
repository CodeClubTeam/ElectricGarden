import React, { useCallback } from 'react';

import { ActionButton } from '../../../../atomic-ui';
import { useApi } from '../../../../data/ApiProvider';
import { BulkActionProps } from './shared';

const ACTION_ID = 'clearlessonsprogress';

// TODO: lots of repeated code with other bulk actions. can be sorted out later
export const ClearLessonsProgressBulkAction = ({
    selectedUsers,
    inProgressActionId,
    onStarted,
    onSuccess,
    onFailure,
    onAllCompleted,
}: BulkActionProps) => {
    const api = useApi();

    const handleClick = useCallback(async () => {
        onStarted(ACTION_ID, 'Clear Lessons Progress');
        const userIds = selectedUsers.map((u) => u.id);

        try {
            const updatedUsers = await api.users.clearLessonProgress(userIds);
            for (const user of updatedUsers) {
                onSuccess(user);
            }
        } catch (error) {
            for (const user of selectedUsers) {
                onFailure(user, error);
            }
        }
        onAllCompleted();
    }, [
        api.users,
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
            Clear Lessons Progress
        </ActionButton>
    );
};
