import { FormikConfig, FormikProps, Field, FieldProps } from 'formik';
import React from 'react';

import {
    BootstrapField,
    FieldValidationError,
    ModalProps,
    Select,
} from '../../../atomic-ui';
import { TeamIdSelectorField } from './TeamSelectorField';
import { OrgMode, orgModes } from '../../../utils';

export interface OrganisationValues {
    name: string;
    line1: string;
    line2: string;
    line3: string;
    city: string;
    postcode: string;
    country: string;
    defaultTeamId: string;
    mode: OrgMode;
}
type Props = {
    form: FormikProps<OrganisationValues>;
    isUpdate?: boolean;
};

export interface GrowableModalFormProps extends ModalProps {
    title: string;
    initialValues: OrganisationValues;
    onSubmit: FormikConfig<OrganisationValues>['onSubmit'];
    isUpdate?: boolean;
}

export const OrganisationForm: React.FC<Props> = ({ form, isUpdate }) => (
    <>
        <BootstrapField
            type="text"
            name="name"
            label="Name"
            placeholder="Enter name"
            required
            autoFocus
        />
        <FieldValidationError name="name" form={form} />
        <BootstrapField type="text" name="line1" label="Line 1" />
        <FieldValidationError name="line1" form={form} />
        <BootstrapField type="text" name="line2" label="Line 2" />
        <FieldValidationError name="line2" form={form} />
        <BootstrapField type="text" name="line3" label="Line 3" />
        <FieldValidationError name="line3" form={form} />
        <BootstrapField type="text" name="city" label="City/Town" />
        <FieldValidationError name="city" form={form} />
        <BootstrapField type="text" name="postcode" label="Postcode" />
        <FieldValidationError name="postcode" form={form} />
        <BootstrapField type="text" name="country" label="Country" />
        <FieldValidationError name="country" form={form} />

        <label htmlFor="defaultTeamId">Default Team</label>
        <Field name="defaultTeamId" id="defaultTeamId">
            {(props: any) => (
                <TeamIdSelectorField
                    {...props}
                    disabled={!isUpdate}
                    unsetLabel="No default team"
                />
            )}
        </Field>
        <FieldValidationError name="defaultTeamId" form={form} />

        <BootstrapField name="mode" label="Mode" required>
            {(props: FieldProps<'mode', OrganisationValues>) => (
                <Select
                    {...(props as any)}
                    value={form.values.mode}
                    onChange={(e) => form.setFieldValue('mode', e.target.value)}
                >
                    {orgModes.map((mode) => (
                        <option key={mode} value={mode}>
                            {mode}
                        </option>
                    ))}
                </Select>
            )}
        </BootstrapField>
        <FieldValidationError name="mode" form={form} />
    </>
);
