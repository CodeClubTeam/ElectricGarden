import React from 'react';
import { FontAwesomeIcon, Props } from '@fortawesome/react-fontawesome';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';

export const NextIcon: React.FC<Omit<Props, 'icon'>> = (props) => (
    <FontAwesomeIcon icon={faChevronCircleRight} {...props} />
);
