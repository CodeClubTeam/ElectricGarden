import React from 'react';
import { FontAwesomeIcon, Props } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';

export const ReplayIcon: React.FC<Omit<Props, 'icon'>> = (props) => (
    <FontAwesomeIcon icon={faRedoAlt} {...props} />
);
