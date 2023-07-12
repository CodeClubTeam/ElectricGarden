import React, { useCallback } from 'react';
import styled from 'styled-components/macro';

import { Button, ButtonProps } from '../../atoms';
import { Dialog, useDialog } from './Dialog';

type Props = {
    header?: React.ReactNode;
    body: React.ReactNode;
    onConfirm: () => void;
    children: React.ReactElement<ButtonProps>;
};

const ButtonsContainer = styled.div`
    text-align: right;

    button {
        margin: 0.25em;
    }
`;

export const ConfirmDialog: React.FC<Props> = ({
    header,
    body,
    onConfirm,
    children,
}) => {
    const { on, getToggleProps, hide } = useDialog('confirm');

    const handleConfirm = useCallback(() => {
        hide();
        onConfirm();
    }, [hide, onConfirm]);

    return (
        <>
            {React.createElement(children.type, {
                ...children.props,
                ...getToggleProps(),
            })}
            {on && (
                <Dialog.Container>
                    <Dialog.Header>
                        {header ? header : <>Confirm</>}
                    </Dialog.Header>
                    <Dialog.Body>{body}</Dialog.Body>
                    <Dialog.Footer>
                        <ButtonsContainer>
                            <Button danger onClick={handleConfirm}>
                                Confirm
                            </Button>
                            <Button secondary onClick={hide}>
                                Cancel
                            </Button>
                        </ButtonsContainer>
                    </Dialog.Footer>
                </Dialog.Container>
            )}
        </>
    );
};
