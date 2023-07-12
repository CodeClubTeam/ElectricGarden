import React from 'react';
import styled from 'styled-components/macro';

import { PhotographedEvent } from '../../types';
import { PhotoObservation } from './PhotoObservation';

const List = styled.ul`
    display: grid;
    grid-template-columns: repeat(4, 25%);
    grid-auto-rows: calc(
        98.25px + 4px
    ); /* yuck magic numbers: thumb width + thumb margins */
    list-style-image: none;
    padding: 0;
    margin: 0 -2px; /* counteract ends of nav */
`;

type ListItemProps = React.LiHTMLAttributes<HTMLLIElement> & {
    selected?: boolean;
};

const ListItem = styled(({ selected, ...props }: ListItemProps) => (
    <li {...props} />
))`
    list-style-type: none;
    margin: 2px;
    opacity: ${({ selected }) => (selected ? 1 : 0.5)};
    transition: opacity 0.1s ease-in-out;

    img {
        padding: 0;
        cursor: pointer;
        object-fit: cover;
        width: 100%;
        height: 100%;
    }
`;

type Props = {
    observations: ServerObservation<PhotographedEvent>[];
    selected?: ServerObservation<PhotographedEvent>;
    onSelect?: (observation: ServerObservation<PhotographedEvent>) => void;
};

export const PhotoObservationNavigation: React.FC<Props> = ({
    observations,
    onSelect,
    selected,
}) => {
    const handleClick = React.useCallback(
        (observation: ServerObservation<PhotographedEvent>) => {
            if (onSelect) {
                onSelect(observation);
            }
        },
        [onSelect],
    );
    return (
        <List>
            {observations.map((obs) => (
                <ListItem
                    key={obs.id}
                    onClick={() => handleClick(obs)}
                    selected={obs === selected}
                >
                    <PhotoObservation observation={obs} thumbnail />
                </ListItem>
            ))}
        </List>
    );
};
