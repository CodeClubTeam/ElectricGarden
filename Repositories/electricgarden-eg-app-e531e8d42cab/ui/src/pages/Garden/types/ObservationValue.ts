// units will be standardised on the database
// but observers will be able to enter the unit of their choice in the UI
// and it will get converted to the standard unit for that type

export type PlantedEvent = {
    type: 'planted';
    data: { method: 'seed' | 'seedling' };
};

export type GerminatedEvent = {
    type: 'germinated';
    data: {};
};

export type WateredEvent = {
    type: 'watered';
    data: {};
};

export type WeededEvent = {
    type: 'weeded';
    data: {};
};

export type SprayedEvent = {
    type: 'sprayed';
    data: {
        for: 'insects' | 'weeds' | 'fungus' | 'other';
        product?: string;
    };
};

export type FertilizedEvent = {
    type: 'fertilised';
    data: {
        product?: string;
    };
};

export type HarvestedEvent = {
    type: 'harvested';
    data: {
        amount: number;
        type: 'weight' | 'volume' | 'count';
    };
};

export type PhotographedEvent = {
    type: 'photographed';
    data: {
        assetId: string;
    };
    url?: string;
};

export type PrunedEvent = {
    type: 'pruned';
    data: {};
};

export type PlantMeasureRecord = {
    type: 'plantMeasure';
    data: {
        value: number;
        type: 'circumference' | 'diameter' | 'length' | 'height';
    };
};

export type ProduceMeasureRecord = {
    type: 'produceMeasure';
    data: {
        value: number;
        type: 'circumference' | 'diameter' | 'length';
    };
};

export type StatusRecord = {
    type: 'status';
    data: {
        health:
            | 'good'
            | 'discoloured'
            | 'diseased'
            | 'parasites'
            | 'bolted'
            | 'choked'
            | 'dead';
    };
};

export type FreeTextRecord = {
    type: 'freeText';
    data: {
        text: string;
    };
};

export type EventObservation =
    | PlantedEvent
    | GerminatedEvent
    | HarvestedEvent
    | WateredEvent
    | FertilizedEvent
    | SprayedEvent
    | WeededEvent
    | PrunedEvent
    | PhotographedEvent;

export type RecordObservation =
    | PlantMeasureRecord
    | ProduceMeasureRecord
    | FreeTextRecord;

export type ObservationValue = EventObservation | RecordObservation;
