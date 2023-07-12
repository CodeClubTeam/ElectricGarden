import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Button } from '../../../atomic-ui';

type Props = {
    errors: string[];
};

export const CsvError = ({ errors }: Props) => {
    const [show, setShow] = useState(true);

    const handleClose = () => {
        setShow(false);
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
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
                <p>Import failed. Some lines have errors listed below:</p>
                <ul>
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
                <p>
                    Click "view sample file" to load an example format to
                    follow.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => handleClose()}>Dismiss</Button>
            </Modal.Footer>
        </Modal>
    );
};
