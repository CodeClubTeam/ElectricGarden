import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Button } from '../../../atomic-ui';
import { ImportFail } from './useUsersCsvImporter';

type Props = {
    fails: ImportFail[];
    onClose: () => void;
};

export const UserImportError = ({ fails, onClose }: Props) => {
    const [show, setShow] = useState(true);

    const handleClose = () => {
        setShow(false);
        onClose();
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
                <p>Upload failed. The below users failed to import</p>
                <ul>
                    {fails.map((fails, index) => (
                        <li key={index}>{fails.user.name}</li>
                    ))}
                </ul>
                <p>Please upload the user csv again.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => handleClose()}>Dismiss</Button>
            </Modal.Footer>
        </Modal>
    );
};
