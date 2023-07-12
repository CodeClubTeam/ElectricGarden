import { Field, FieldArray, FieldProps, Formik, FormikHelpers } from "formik";
import React from "react";
import Alert from "react-bootstrap/esm/Alert";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import { Loading } from "../../atomic-ui";
import { useFetchActions, usePutActions } from "../api";
import { DeviceAction } from "../types";

type FormValues = {
  actions: DeviceAction[];
};

type Props = {
  serial: string;
};

export const DeviceActionsEditor = ({ serial }: Props) => {
  const { isFetching, isError, refetch, data: actions } = useFetchActions(
    serial,
  );
  const putActions = usePutActions(serial);

  if (isFetching) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Alert variant="danger">
        Error fetching actions.{" "}
        <Button onClick={() => refetch()}>Try again</Button>
      </Alert>
    );
  }

  if (!actions) {
    return null;
  }

  const initialValues = {
    actions: actions.map(({ type, payload }) => ({
      type,
      payload: JSON.stringify(payload, undefined, "  "),
    })),
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    try {
      const actions = values.actions.map(({ type, payload }) => ({
        type,
        payload: payload ? JSON.parse(payload) : undefined,
      }));
      setSubmitting(true);
      await putActions(actions);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Formik<FormValues> onSubmit={handleSubmit} initialValues={initialValues}>
      {({ handleSubmit, dirty, values, isSubmitting, handleReset }) => (
        <Form onSubmit={handleSubmit as any} onReset={handleReset}>
          <FieldArray
            name="actions"
            render={(helpers) => (
              <>
                {values.actions.map((_action, index) => (
                  <div key={index}>
                    <Form.Group controlId={`actions.${index}`}>
                      <Form.Label>Type</Form.Label>
                      <Field name={`actions[${index}].type`}>
                        {({ field }: FieldProps) => (
                          <Form.Control {...field} type="text" />
                        )}
                      </Field>
                    </Form.Group>
                    <Form.Group controlId={`actions.${index}`}>
                      <Form.Label>Payload JSON (optional)</Form.Label>
                      <Field name={`actions[${index}].payload`}>
                        {({ field }: FieldProps) => (
                          <Form.Control {...field} type="text" />
                        )}
                      </Field>
                    </Form.Group>
                    <Button
                      variant="danger"
                      onClick={() => helpers.remove(index)}
                    >
                      -
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() => helpers.push({ type: "", payload: "" })}
                >
                  +
                </Button>
              </>
            )}
          />

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
