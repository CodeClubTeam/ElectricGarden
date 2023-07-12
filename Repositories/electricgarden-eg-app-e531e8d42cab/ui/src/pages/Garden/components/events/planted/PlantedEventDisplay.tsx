import React from 'react';
import { PlantedEvent } from '../../../types';
import { EventDisplayProp } from '../valueProps';

const methodTypeToTitle: Record<PlantedEvent['data']['method'], string> = {
    seed: 'From Seed',
    seedling: 'Seedling',
};

export const PlantedEventDisplay: React.FC<EventDisplayProp<PlantedEvent>> = ({
    value,
}) => <p>{methodTypeToTitle[value.data.method]}</p>;
