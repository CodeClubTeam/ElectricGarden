import { Field, FieldConfig } from 'formik';
import React from 'react';

export const CheckboxField: React.FC<FieldConfig & {
    id?: string;
    label?: string;
    required?: boolean;
    autoFocus?: boolean;
}> = ({ name, label, required, autoFocus, id, ...fieldProps }) => {
    const Input = () => (
        <Field
            type="checkbox"
            {...fieldProps}
            id={id}
            name={name}
            required={required}
            autoFocus={autoFocus}
        ></Field>
    );
    return (
        <div className="form-group">
            <div className="checkbox">
                {label && (
                    <label htmlFor={id} className="control-label">
                        <Input />
                        {label}
                    </label>
                )}
                {!label && <Input />}
            </div>
        </div>
    );
};
