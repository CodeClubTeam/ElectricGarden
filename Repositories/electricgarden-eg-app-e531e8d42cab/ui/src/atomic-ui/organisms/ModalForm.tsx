import { Formik, FormikConfig, FormikProps } from 'formik';
import React from 'react';
import { Modal } from 'react-bootstrap';

import { SubmitButton } from '../atoms';
import { ConfirmDialog } from './dialog';

export interface ModalProps {
    onClose: () => void;
    show: boolean;
}

interface ModalFormProps<TModel extends {}> {
    modalConfig: ModalProps;
    formikConfig: FormikConfig<TModel>;
}

export interface ModalOptions<TModel extends {}> {
    submitButtonContent?: React.ReactChild;
    confirm?: {
        title: string;
        message: string;
        skipIf?: (values: TModel) => boolean;
    };
}

export const ModalFormCreate = <TModel extends {}>(
    title: string,
    { submitButtonContent, confirm }: ModalOptions<TModel> = {},
): React.FC<ModalFormProps<TModel>> => {
    return ({
        modalConfig: { show, onClose },
        formikConfig: { render, ...formikConfig },
    }) => {
        return (
            <Modal show={show} onHide={onClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Formik<TModel> {...formikConfig}>
                    {(props: FormikProps<TModel>) => (
                        <form onSubmit={props.handleSubmit}>
                            <Modal.Body>{render && render(props)}</Modal.Body>
                            <Modal.Footer>
                                {confirm &&
                                !(
                                    confirm.skipIf &&
                                    confirm.skipIf(props.values)
                                ) ? (
                                    <ConfirmDialog
                                        header={confirm.title}
                                        body={<p>{confirm.message}</p>}
                                        onConfirm={() => props.submitForm()}
                                    >
                                        <SubmitButton
                                            type="button"
                                            submitting={props.isSubmitting}
                                            disabled={!props.isValid}
                                        >
                                            {submitButtonContent || 'submit'}
                                        </SubmitButton>
                                    </ConfirmDialog>
                                ) : (
                                    <SubmitButton
                                        submitting={props.isSubmitting}
                                        disabled={!props.isValid}
                                    >
                                        {submitButtonContent || 'submit'}
                                    </SubmitButton>
                                )}
                            </Modal.Footer>
                        </form>
                    )}
                </Formik>
            </Modal>
        );
    };
};
