import React from 'react';
import { useDispatch } from 'react-redux';

import { ModalFormCreate, ModalProps } from '../../../atomic-ui';
import { useFormSubmitHandler } from '../../../hooks/useFormSubmitHandler';
import * as actions from '../actions';
import { OrganisationForm, OrganisationValues } from './OrganisationForm';
import { orgValidationSchema } from './orgValidationSchema';
import { OrgMode } from '../../../utils';

const AddOrganisationModalForm = ModalFormCreate<OrganisationValues>(
    'Add Organisation',
);

interface OrganisationAddProps extends ModalProps {}

export const OrganisationAdd: React.FC<OrganisationAddProps> = ({
    show,
    onClose,
}) => {
    const dispatch = useDispatch();

    const handleSubmit = useFormSubmitHandler<
        OrganisationValues,
        ServerOrganisation
    >(
        ({ name, line1, line2, line3, city, postcode, country }, api) =>
            api.organisation.create({
                name,
                address: {
                    line1,
                    line2,
                    line3,
                    city,
                    postcode,
                    country,
                },
            }),
        {
            onSuccess: (organisation) => {
                dispatch(actions.updatedOrCreatedOrganisation(organisation));
                onClose();
            },
        },
    );

    return (
        <AddOrganisationModalForm
            modalConfig={{ show, onClose }}
            formikConfig={{
                initialValues: {
                    name: '',
                    line1: '',
                    line2: '',
                    line3: '',
                    city: '',
                    postcode: '',
                    country: 'New Zealand',
                    defaultTeamId: '',
                    mode: OrgMode.standard,
                },
                validationSchema: orgValidationSchema,
                onSubmit: handleSubmit,
                validateOnMount: true,
                render: (form) => <OrganisationForm form={form} />,
            }}
        />
    );
};
