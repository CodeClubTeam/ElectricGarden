import React from 'react';
import { useDispatch } from 'react-redux';

import { ModalFormCreate, ModalProps } from '../../../atomic-ui';
import { useFormSubmitHandler } from '../../../hooks/useFormSubmitHandler';
import * as actions from '../actions';
import { OrganisationForm, OrganisationValues } from './OrganisationForm';
import { orgValidationSchema } from './orgValidationSchema';
import { OrgMode } from '../../../utils';

const EditOrganisationModalForm = ModalFormCreate<OrganisationValues>(
    'Edit Organisation',
);

interface Props extends ModalProps {
    organisation: ServerOrganisation;
}

export const OrganisationEdit: React.FC<Props> = ({
    show,
    onClose,
    organisation,
}) => {
    const dispatch = useDispatch();

    const {
        name,
        address: { line1, line2, line3, city, postcode, country },
        defaultTeamId,
        mode,
    } = organisation;

    const initialValues: OrganisationValues = {
        name,
        line1: line1 ?? '',
        line2: line2 ?? '',
        line3: line3 ?? '',
        city: city ?? '',
        postcode,
        country,
        defaultTeamId: defaultTeamId ?? '',
        mode: mode ?? OrgMode.standard,
    };

    const handleSubmit = useFormSubmitHandler<
        OrganisationValues,
        ServerOrganisation
    >(
        (
            {
                name,
                line1,
                line2,
                city,
                postcode,
                country,
                defaultTeamId,
                mode,
            },
            api,
        ) =>
            api.organisation.update(organisation.id, {
                name,
                address: {
                    line1,
                    line2,
                    city,
                    postcode,
                    country,
                },
                defaultTeamId: defaultTeamId || undefined,
                mode,
            }),
        {
            onSuccess: (updated) => {
                dispatch(actions.updatedOrCreatedOrganisation(updated));
                onClose();
            },
        },
    );

    return (
        <EditOrganisationModalForm
            modalConfig={{ show, onClose }}
            formikConfig={{
                initialValues,
                validationSchema: orgValidationSchema,
                onSubmit: handleSubmit,
                render: (form) => <OrganisationForm form={form} isUpdate />,
            }}
        />
    );
};
