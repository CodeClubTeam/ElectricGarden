import React from 'react';
import { Modal } from 'react-bootstrap';
import { Button } from '../../../../atomic-ui';
import styled from 'styled-components/macro';

type Props = {
    title?: string;
    show: boolean;
    onClose: () => void;
    succeeded: ServerUser[];
    failed: Array<{ user: ServerUser; error: unknown }>;
};

const ErrorPara = styled.p`
    color: red;
`;

// this is a bit rough. needs a UI design but hopefully the errors rarely seen
export const CompletedSummary = ({
    show,
    title = 'Bulk Action',
    onClose,
    succeeded,
    failed,
}: Props) => (
    <Modal show={show} onHide={onClose} backdrop="static">
        <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <h3>{title} Completed</h3>
            <p>{succeeded.length} users updated successfully</p>
            {failed.length > 0 && (
                <div>
                    <ErrorPara>
                        The following users were not able to be updated due to
                        an error:
                    </ErrorPara>
                    <ul>
                        {failed.map(({ user }) => (
                            <li>
                                {user.name} ({user.email})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
    </Modal>
);
