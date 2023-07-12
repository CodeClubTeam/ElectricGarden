import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Alert } from 'react-bootstrap';

import pushButtonImg from './pushbutton.png';

type Props = {
    loading?: React.ReactNode;
};

export const PushTheRedButtonPrompt = ({ loading }: Props) => {
    return (
        <>
            <Alert type="info">
                <p>
                    <FontAwesomeIcon icon={faLightbulb} /> Push the red button
                    on the device and wait up to 30 seconds to see live data.
                </p>
            </Alert>
            <img src={pushButtonImg} alt="Device with live mode button" />
            <p>{loading}</p>
        </>
    );
};
