import { Field, FieldConfig } from 'formik';
import React from 'react';

export const BootstrapField: React.FC<
    FieldConfig & {
        id?: string;
        label?: string;
        placeholder?: string;
        required?: boolean;
        autoFocus?: boolean;
    }
> = ({ name, label, placeholder, required, autoFocus, id, ...fieldProps }) => {
    return (
        <div className="form-group">
            {label && (
                <label htmlFor={id} className="control-label">
                    {label}
                </label>
            )}
            <Field
                {...fieldProps}
                id={id}
                name={name}
                placeholder={placeholder}
                required={required}
                autoFocus={autoFocus}
                className="form-control"
            />
        </div>
    );
};
