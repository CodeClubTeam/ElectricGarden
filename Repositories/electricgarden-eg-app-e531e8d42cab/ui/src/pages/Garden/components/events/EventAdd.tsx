import { Formik, FormikHelpers } from 'formik';
import moment from 'moment';
import React, { useCallback } from 'react';
import styled from 'styled-components/macro';

import { useAddObservationHandler } from '../../hooks/useAddObservationHandler';
import { EventForm } from './EventForm';
import { eventObservationValidationSchema } from './eventObservationValidationSchema';
import { EventObservationModel, initialEventValues } from './model';

type Props = {};

const Container = styled.div``;

const Heading = styled.h2`
    margin-top: 1em;
`;

export const EventAdd: React.FC<Props> = () => {
    const { handleAdd } = useAddObservationHandler();

    const handleSubmit = useCallback(
        async (
            values: EventObservationModel,
            formActions: FormikHelpers<EventObservationModel>,
        ) => {
            try {
                if (values.value) {
                    const date = moment(values.occurredOn);
                    await handleAdd({
                        ...values,
                        occurredOn: date.startOf('day')
                            ? date.add(12, 'hours') // make it 12pm as they can only enter date
                            : date,
                        value: values.value,
                    });
                }
                formActions.setSubmitting(false);
                formActions.resetForm();
            } catch {
                formActions.setSubmitting(false);
            }
        },
        [handleAdd],
    );

    return (
        <Container>
            <Heading>Record New Event</Heading>
            <Formik<EventObservationModel>
                initialValues={initialEventValues}
                onSubmit={handleSubmit}
                validationSchema={eventObservationValidationSchema}
                component={EventForm}
            />
        </Container>
    );
};
