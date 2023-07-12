import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../actions';
import {
    createAppStructuredSelector,
    errorOrUndefinedSelector,
} from '../../selectors';
import { Button } from '../atoms';

export const ErrorModal: React.FC = () => {
    const { error } = useSelector(
        createAppStructuredSelector({
            error: errorOrUndefinedSelector,
        }),
    );

    const dispatch = useDispatch();

    const handleHide = useCallback(() => {
        dispatch(actions.dismissError());
    }, [dispatch]);

    const show = !!error;

    return (
        <Modal show={show} onHide={handleHide} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon
                        icon={faExclamationCircle}
                        style={{ color: 'red' }}
                    />{' '}
                    An error has occurred
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <ul>
                        {error.messages.map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                    </ul>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => handleHide()}>Dismiss</Button>
            </Modal.Footer>
        </Modal>
    );
};
