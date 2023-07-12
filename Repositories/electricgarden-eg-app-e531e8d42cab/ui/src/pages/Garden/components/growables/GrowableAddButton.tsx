import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import { TinyButton } from '../../../../atomic-ui';

type Props = {
    onClick: () => void;
};

export const GrowableAddButton: React.FC<Props> = ({ onClick }) => {
    return (
        <TinyButton onClick={onClick} title="Add Plant/Crop">
            <FontAwesomeIcon icon={faPlusCircle} />
        </TinyButton>
    );
};
