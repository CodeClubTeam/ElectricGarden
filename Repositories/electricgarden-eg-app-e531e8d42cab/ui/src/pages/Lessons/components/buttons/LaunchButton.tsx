import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { Button } from '../../../../atomic-ui';
import { NextIcon, ReplayIcon } from '../icons';

type Props = {
    status?: LessonStatus;
    submitting?: boolean;
    onClick?: () => void;
    disabled?: boolean;
};

export const LaunchButton: React.FC<Props> = ({
    status,
    onClick,
    submitting,
    disabled,
}) => {
    const redo = status === 'completed';
    return (
        <Button
            onClick={onClick ? () => onClick() : undefined}
            secondary={redo}
            disabled={submitting || disabled}
        >
            {submitting && (
                <>
                    <FontAwesomeIcon icon={faSpinner} spin />{' '}
                </>
            )}
            {!status && !redo && (
                <>
                    start lesson <NextIcon />
                </>
            )}
            {redo && (
                <>
                    repeat lesson <ReplayIcon />
                </>
            )}
        </Button>
    );
};
