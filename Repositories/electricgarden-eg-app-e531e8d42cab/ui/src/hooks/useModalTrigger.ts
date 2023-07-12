import React from 'react';

export const useModalTrigger = () => {
    const [show, setShow] = React.useState(false);

    return {
        show,
        handleOpen: () => {
            setShow(true);
        },
        handleClose: () => {
            setShow(false);
        },
    };
};
