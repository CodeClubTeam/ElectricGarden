import React from 'react';

import { EventObservation } from '../../types';
import { getManifest } from './manifests';

const NotFoundComponent = ({ value }: { value: EventObservation }) =>
    value ? <p>Definition for event type {value.type} not found</p> : null;

const NullComponent = () => null;

export const getInputComponent = <TEvent extends EventObservation>(
    type: TEvent['type'],
) => {
    const manifest = getManifest(type);
    if (manifest) {
        return manifest.inputComponent || NullComponent;
    }
    return NotFoundComponent;
};

export const getDisplayComponent = <TEvent extends EventObservation>(
    type: TEvent['type'],
) => {
    const manifest = getManifest(type);
    if (manifest) {
        return manifest.displayComponent || NullComponent;
    }
    return NotFoundComponent;
};
