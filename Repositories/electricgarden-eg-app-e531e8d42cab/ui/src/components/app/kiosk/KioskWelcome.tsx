import React from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components/macro';
import { Button } from '../../../atomic-ui';
import { useClearLessonsProgress } from '../../../pages/Lessons';

const ContinueButtonContainer = styled.div`
    text-align: center;
    margin-bottom: 10px;
`;

const Border = styled.div`
    border: 5px;
    border-style: solid;
    border-color: #2ed03c;
    border-radius: 5px;
`;

type Props = {
    show: boolean;
    onShowChange: (show: boolean) => void;
};

export const KioskWelcome = ({ show, onShowChange }: Props) => {
    const clearProgress = useClearLessonsProgress();
    const handleClose = () => {
        clearProgress();
        onShowChange(false);
    };
    return (
        <div>
            <Modal show={show} onHide={handleClose} backdrop="static">
                <Border>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Welcome to the Electric Garden!
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            The Electric Garden is a device that collects data
                            about its environment.
                        </p>
                        <p>
                            Here, you can explore your local data and test your
                            knowledge with a project.
                        </p>
                    </Modal.Body>
                    <ContinueButtonContainer>
                        <Button onClick={handleClose}>Continue</Button>
                    </ContinueButtonContainer>
                </Border>
            </Modal>
        </div>
    );
};
