import React from 'react';
import { ObservationData, DataItem, EventObservation } from '../../types';
import { iconByEventType } from '../eventIcons';

const emojiByType: Partial<Record<ObservationData['type'], string>> = {
    freeText: '❝',
    plantMeasure: '?',
    produceMeasure: '?',
};

const getSvgForType = (type: EventObservation['type']) =>
    iconByEventType[type] || undefined;

const getEmojiForType = (type: ObservationData['type']) =>
    emojiByType[type] || '?';

export const DynaPoint: React.FC<Partial<DataItem>> = (props) => {
    const { x, y, datum, events, ...rest } = props;
    if (!(datum && x && y)) {
        return null;
    }
    const SvgIcon = getSvgForType(datum.type as any);
    if (SvgIcon) {
        return <SvgIcon x={x} y={y} />;
    }
    return (
        <text x={x} y={y} fontSize={24} {...rest} {...events}>
            {getEmojiForType(datum.type)}
        </text>
    );
};
