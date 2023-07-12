import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useIdleTimer } from 'react-idle-timer';
import { useHistory } from 'react-router-dom';
import { Button } from '../../../atomic-ui';
import styled from 'styled-components/macro';

const ResetButtonContainer = styled.div`
    float: left;
    margin-left: 10%;
`;

const ContinueButtonContainer = styled.div`
    float: right;
    margin-right: 10%;
`;

const Border = styled.div`
    border: 5px;
    border-style: solid;
    border-color: #2ed03c;
    border-radius: 5px;
`;

type Props = {
    onReset: () => void;
};

export const KioskIdle = ({ onReset }: Props) => {
    const [show, setShow] = useState(false);
    const history = useHistory();

    const handleOnIdle = () => {
        setShow(true);
    };

    useIdleTimer({
        timeout: 1000 * 60 * 3,
        onIdle: handleOnIdle,
        startOnMount: false,
        debounce: 500,
    });

    const handleClose = () => {
        setShow(false);
    };

    const handleReset = useCallback(() => {
        handleClose();
        history.push('/garden');
        onReset();
    }, [history, onReset]);

    useEffect(() => {
        let activeTimeout: ReturnType<typeof setTimeout> | undefined;
        if (show) {
            activeTimeout = setTimeout(handleReset, 1000 * 60 * 1);
        } else if (activeTimeout) {
            clearTimeout(activeTimeout);
            activeTimeout = undefined;
        }
        return () => {
            if (activeTimeout) {
                clearTimeout(activeTimeout);
            }
        };
    }, [handleReset, show]);

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Border>
                <Modal.Header closeButton>
                    <Modal.Title>Are you still there?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        We've noticed that you've gone quiet. Would you like to
                        continue with your session or start again?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <ResetButtonContainer>
                        <Button onClick={handleClose}>continue</Button>
                    </ResetButtonContainer>
                    <ContinueButtonContainer>
                        <Button onClick={handleReset}>reset</Button>
                    </ContinueButtonContainer>
                </Modal.Footer>
            </Border>
        </Modal>
    );
};
