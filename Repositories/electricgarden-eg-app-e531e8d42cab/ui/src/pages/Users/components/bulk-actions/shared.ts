export type BulkActionProps = {
    selectedUsers: ServerUser[];
    inProgressActionId?: string;
    onStarted: (actionId: string, title: string) => void;
    onSuccess: (user: ServerUser) => void;
    onFailure: (user: ServerUser, error: unknown) => void;
    onAllCompleted: () => void;
};
