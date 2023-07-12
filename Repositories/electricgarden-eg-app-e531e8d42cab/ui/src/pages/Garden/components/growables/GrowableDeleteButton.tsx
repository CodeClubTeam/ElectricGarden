import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { ConfirmDialog, TinyButton } from '../../../../atomic-ui';
import {
    useCanDeleteGrowable,
    useGrowableDeleteHandler,
    useSelectedGrowable,
} from '../../hooks';

export const GrowableDeleteButton: React.FC = () => {
    const growable = useSelectedGrowable();
    const canDelete = useCanDeleteGrowable();
    const { handleDelete, deleting } = useGrowableDeleteHandler(growable);
    const history = useHistory();
    const { url } = useRouteMatch();

    const handleDeleteThenRedirect = React.useCallback(async () => {
        await handleDelete();
        history.replace(url.replace(new RegExp(`/${growable.id}$`), ''));
    }, [growable.id, handleDelete, history, url]);

    if (!canDelete) {
        return null;
    }

    return (
        <ConfirmDialog
            header="Confirm deletion"
            body={<p>Are you sure you want to delete {growable.title}?</p>}
            onConfirm={handleDeleteThenRedirect}
        >
            <TinyButton disabled={deleting} title="Delete">
                <FontAwesomeIcon icon={faTrash} size="2x" />
            </TinyButton>
        </ConfirmDialog>
    );
};
