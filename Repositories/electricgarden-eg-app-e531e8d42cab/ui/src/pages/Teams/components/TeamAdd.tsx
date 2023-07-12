import { Field } from 'formik';
import React from 'react';

import {
    BootstrapField,
    FieldValidationError,
    ModalFormCreate,
    ModalProps,
} from '../../../atomic-ui';
import { UserTags } from '../../../components/common';
import { useTeamAdd } from '../hooks';
import { TeamFormValues } from '../types';
import { teamValidationSchema } from './validationSchemas';

const AddTeamModalForm = ModalFormCreate<TeamFormValues>('Add Team');

interface TeamAddProps extends ModalProps {}

export const TeamAdd: React.FC<TeamAddProps> = ({ show, onClose }) => {
    const handleSubmit = useTeamAdd({ onCompleted: onClose });

    return (
        <AddTeamModalForm
            modalConfig={{ show, onClose }}
            formikConfig={{
                initialValues: {
                    name: '',
                    leaderUserIds: [],
                },
                validationSchema: teamValidationSchema,
                onSubmit: handleSubmit,
                render: (props) => (
                    <>
                        <BootstrapField
                            id="teamName"
                            type="text"
                            name="name"
                            label="Name"
                            placeholder="Enter name"
                            required
                            autoFocus
                        />
                        <FieldValidationError name="name" form={props} />

                        <label htmlFor="leaderUserIds">Leaders</label>
                        <Field name="leaderUserIds" component={UserTags} />
                        <FieldValidationError
                            name="leaderUserIds"
                            form={props}
                        />
                    </>
                ),
            }}
        />
    );
};
