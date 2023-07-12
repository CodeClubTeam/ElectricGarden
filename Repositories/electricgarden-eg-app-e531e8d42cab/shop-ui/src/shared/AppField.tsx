import { FieldAttributes, FormikValues, useField } from 'formik';
import React from 'react';

export type AppFieldProps<Values extends FormikValues> = {
  label?: React.ReactNode;
} & Omit<FieldAttributes<any>, 'name'> & { name: keyof Values };

// use class name for easy styling by consumers e.g. put in a grid column
export const ValidationError: React.FC = ({ children }) => (
  <div className="validation-error">{children}</div>
);

export const AppField = <Values extends FormikValues>({
  label,
  name,
  ...props
}: AppFieldProps<Values>) => {
  const [field, meta] = useField({ ...props, name: name as string });
  return (
    <>
      {label && <label htmlFor={props.id || props.name}>{label}</label>}
      <input {...field} {...props} />
      {meta.touched && meta.error && (
        <ValidationError>{meta.error}</ValidationError>
      )}
    </>
  );
};

export const AppCheckboxField = <Values extends {}>({
  label,
  name,
  ...props
}: AppFieldProps<Values>) => {
  const [field, meta] = useField({
    ...props,
    name: name as string,
    type: 'checkbox', // need this for fomirk to populate checked property properly
  } as any); // hackery around weird types stuff. might go away with formik update
  return (
    <>
      <label>
        <input {...field} {...props} type="checkbox" /> {label}
      </label>
      <div className="validation-error">
        {meta.touched && meta.error ? (
          <ValidationError>{meta.error}</ValidationError>
        ) : null}
      </div>
    </>
  );
};
