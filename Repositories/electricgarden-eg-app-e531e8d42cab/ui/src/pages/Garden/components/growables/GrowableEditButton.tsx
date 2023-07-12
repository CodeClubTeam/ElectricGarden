import React from 'react';
import styled from 'styled-components/macro';

import { TinyButton } from '../../../../atomic-ui';
import { useModalTrigger } from '../../../../hooks';
import { useCanEditGrowable, useSelectedGrowable } from '../../hooks';
import { GrowableEdit } from './GrowableEdit';

const TransparentTinyButton = styled(TinyButton)`
    background: none;
    :hover {
        background: none;
    }
`;

const CogIcon = () => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path
            d="M30 16.875V13.125L26.8125 12C26.4375 10.875 26.0625 9.75 25.5 8.625L27 5.625L24.375 3L21.375 4.5C20.4375 3.9375 19.3125 3.375 18 3.1875L16.875 0H13.125L12 3.1875C10.875 3.5625 9.75 3.9375 8.8125 4.5L5.8125 3L3 5.8125L4.5 8.8125C3.9375 9.75 3.5625 10.875 3.1875 12L0 13.125V16.875L3.1875 18C3.5625 19.125 3.9375 20.25 4.5 21.375L3 24.375L5.625 27L8.625 25.5C9.5625 26.0625 10.6875 26.625 12 26.8125L13.125 30H16.875L18 26.8125C19.125 26.4375 20.25 26.0625 21.375 25.5L24.375 27L27 24.375L25.5 21.375C26.0625 20.4375 26.625 19.3125 26.8125 18L30 16.875ZM15 22.5C10.875 22.5 7.5 19.125 7.5 15C7.5 10.875 10.875 7.5 15 7.5C19.125 7.5 22.5 10.875 22.5 15C22.5 19.125 19.125 22.5 15 22.5Z"
            fill="currentColor"
        />
        <path
            d="M19.875 14.8125C19.875 16.0557 19.3811 17.248 18.5021 18.1271C17.623 19.0061 16.4307 19.5 15.1875 19.5C13.9443 19.5 12.752 19.0061 11.8729 18.1271C10.9939 17.248 10.5 16.0557 10.5 14.8125C10.5 13.5693 10.9939 12.377 11.8729 11.4979C12.752 10.6189 13.9443 10.125 15.1875 10.125C16.4307 10.125 17.623 10.6189 18.5021 11.4979C19.3811 12.377 19.875 13.5693 19.875 14.8125Z"
            fill="currentColor"
        />
    </svg>
);

export const GrowableEditButton: React.FC = () => {
    const growable = useSelectedGrowable();
    const canEdit = useCanEditGrowable();
    const { show, handleOpen, handleClose } = useModalTrigger();
    if (!canEdit) {
        return null;
    }
    return (
        <>
            <GrowableEdit
                growable={growable}
                show={show}
                onClose={handleClose}
            />
            <TransparentTinyButton onClick={handleOpen} title="Edit">
                <CogIcon />
            </TransparentTinyButton>
        </>
    );
};
