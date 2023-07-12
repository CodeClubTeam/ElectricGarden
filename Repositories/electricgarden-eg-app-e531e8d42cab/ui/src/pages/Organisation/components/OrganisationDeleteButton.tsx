import React, { useCallback, useState } from 'react';
import { SubmitButton } from '../../../atomic-ui';
import { useApi } from '../../../data/ApiProvider';

type Props = {
    organisation: ServerOrganisation;
};

const useDeleteOrganisation = (organisation: ServerOrganisation) => {
    const [deleting, setDeleting] = useState(false);
    const api = useApi();
    const deleteOrg = useCallback(async () => {
        try {
            setDeleting(true);
            await api.organisation.delete(organisation);
            setDeleting(false);
            window.location.reload();
        } catch (err) {
            setDeleting(false);
            throw err;
        }
    }, [api.organisation, organisation]);

    return {
        deleteOrg,
        deleting,
    };
};

export const OrganisationDeleteButton: React.FC<Props> = ({ organisation }) => {
    const { deleteOrg, deleting } = useDeleteOrganisation(organisation);
    const handleDelete = useCallback(async () => {
        await deleteOrg();
    }, [deleteOrg]);

    return (
        <SubmitButton danger onClick={handleDelete} submitting={deleting}>
            Delete
        </SubmitButton>
    );
};
