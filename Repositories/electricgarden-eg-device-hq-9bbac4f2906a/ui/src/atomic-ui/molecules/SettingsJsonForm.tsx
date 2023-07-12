import { Field, FieldProps, Formik, FormikHelpers } from "formik";
import React from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";

type FormValues = {
  settings: string;
};

export type SettingsJsonFormProps = {
  initialValues: FormValues;
  onSubmit: (newValues: FormValues) => Promise<void>;
};

export const SettingsJsonForm = ({
  initialValues,
  onSubmit,
}: SettingsJsonFormProps) => {
  const handleSubmit = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    setSubmitting(true);
    onSubmit(values).finally(() => setSubmitting(false));
  };

  return (
    <Formik<FormValues> onSubmit={handleSubmit} initialValues={initialValues}>
      {({ handleSubmit, dirty, isSubmitting, handleReset }) => (
        <Form onSubmit={handleSubmit as any} onReset={handleReset}>
          <Form.Group controlId="settings">
            <Field name="settings">
              {({ field }: FieldProps) => (
                <Form.Control
                  {...field}
                  as="textarea"
                  rows={20}
                  cols={80}
                  disabled={isSubmitting}
                />
              )}
            </Field>
          </Form.Group>
          {dirty && (
            <div>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                Save
              </Button>
              <Button type="reset" variant="link" disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};
