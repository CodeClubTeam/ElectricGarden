import { Formik } from 'formik';
import React from 'react';

import {
    BootstrapField,
    FieldValidationError,
    SubmitButton,
} from '../../../atomic-ui';
import { useCurrentUser } from '../../../hooks';
import { useTeamAdd } from '../hooks';
import { TeamFormValues } from '../types';
import { teamValidationSchema } from './validationSchemas';

type Props = {
    hideValidationErrors?: boolean;
};

export const TeamQuickAdd: React.FC<Props> = ({ hideValidationErrors }) => {
    const { id: userId } = useCurrentUser();
    const handleSubmit = useTeamAdd();

    return (
        <Formik<TeamFormValues>
            initialValues={{ name: '', leaderUserIds: [userId] }}
            validationSchema={teamValidationSchema}
            onSubmit={handleSubmit}
        >
            {(props) => (
                <form onSubmit={props.handleSubmit}>
                    <BootstrapField
                        id="teamName"
                        type="text"
                        name="name"
                        placeholder="team name"
                        autoFocus
                    />
                    {!hideValidationErrors && (
                        <FieldValidationError name="name" form={props} />
                    )}
                    <SubmitButton
                        submitting={props.isSubmitting}
                        disabled={!props.isValid}
                    >
                        Create My First Team
                    </SubmitButton>
                </form>
            )}
        </Formik>
    );
};
