import { Field, FieldProps, FormikProps } from 'formik';
import React from 'react';
import styled from 'styled-components/macro';

import {
    FieldValidationError,
    SubmitButton,
} from '../../../../atomic-ui/atoms';
import { EventObservation } from '../../types';
import { EventTypeSelectorInput } from './EventTypeSelector';
import { getInputComponent } from './getEventComponent';
import { getInitialValue } from './manifests';
import { EventObservationModel } from './model';

type Props = FormikProps<EventObservationModel>;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 2;
    grid-auto-rows: 2;
`;

const EventTypeContainer = styled.div`
    grid-column-start: 1;
`;

const OccurredOnContainer = styled.div`
    grid-column-start: 2;
    text-align: right;
`;

const DataContainer = styled.div`
    grid-column: 1 / span 2;
    grid-row: 2;
`;

const CommentContainer = styled.div`
    grid-column: 1 / span 2;
    grid-row: 3;
`;

const CommentTextArea = styled.textarea`
    width: 100%;
`;

const SubmitButtonContainer = styled.div`
    text-align: right;
`;

export const EventForm: React.FC<Props> = (form) => {
    return (
        <form onSubmit={form.handleSubmit}>
            <Grid>
                <EventTypeContainer>
                    <Field
                        name="value.type"
                        id="value-type"
                        component={EventTypeSelectorInput}
                        onChange={(type: EventObservation['type']) => {
                            form.setFieldValue(
                                'value.data' as any, // TODO: bug in updated formik types not allowing nested
                                getInitialValue(type),
                            );
                        }}
                    />
                    <FieldValidationError name="value-type" form={form} />
                </EventTypeContainer>

                <OccurredOnContainer>
                    <label htmlFor="occurredOn">Occurred On</label>
                    <Field name="occurredOn" id="occurredOn" type="date" />
                    <FieldValidationError name="occurredOn" form={form} />
                </OccurredOnContainer>
                {form.values.value && form.values.value.type && (
                    <DataContainer>
                        <Field
                            name="value.data"
                            id="value-data"
                            component={getInputComponent(
                                form.values.value.type,
                            )}
                        />
                    </DataContainer>
                )}
                <CommentContainer>
                    <Field name="comments">
                        {({
                            field,
                        }: FieldProps<EventObservationModel['comments']>) => (
                            <CommentTextArea
                                rows={3}
                                id="comments"
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Any comments"
                            />
                        )}
                    </Field>
                </CommentContainer>
            </Grid>

            <SubmitButtonContainer>
                <SubmitButton
                    submitting={form.isSubmitting}
                    disabled={!form.isValid}
                >
                    Record
                </SubmitButton>
            </SubmitButtonContainer>
        </form>
    );
};
