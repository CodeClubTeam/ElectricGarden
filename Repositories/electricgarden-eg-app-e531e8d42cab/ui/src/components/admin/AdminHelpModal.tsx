import React from 'react';
import styled from 'styled-components/macro';
import { useModalTrigger } from '../../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { Modal } from 'react-bootstrap';

const ActionButtonContainer = styled.div`
    margin: 20px;
`;

const HelpButton = styled.button`
    background-color: transparent;
    line-height: 22px;
    border: none;
    font-size: 23px;
    color: white;
`;

const Container = styled.div`
    bottom: 0;
    position: fixed;
`;

export const AdminHelpModal: React.FC = () => {
    const { show, handleOpen, handleClose } = useModalTrigger();

    return (
        <Container>
            <ActionButtonContainer>
                <HelpButton onClick={handleOpen}>
                    <FontAwesomeIcon
                        style={{
                            fontSize: '1.1em',
                            marginRight: '5px',
                        }}
                        transform={'down-1'}
                        icon={faQuestionCircle}
                    />
                    Help
                </HelpButton>
            </ActionButtonContainer>
            <Modal
                size={'sm'}
                show={show}
                onHide={handleClose}
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{'Helpful Links'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Getting Started:
                    <br />
                    <br />
                    <a
                        href={'https://www.electricgarden.nz/getstarted'}
                        target={'_blank'}
                        rel={'noopener noreferrer'}
                    >
                        electricgarden.nz/getstarted
                    </a>
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'flex-start' }}>
                    Contact us at:
                    <a href={'mailto: abc@example.com'}>
                        team@electricgarden.nz
                    </a>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};
