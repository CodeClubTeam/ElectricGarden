import { ObservationValue } from './ObservationValue';

export type ObservationsState = FetchState & {
    observations: ServerObservation[];
};

export type DataItem = {
    x: number;
    y: number;
    datum: ObservationData;
    events: any;
};

export type ObservationData = {
    timestamp: Date;
    type: ObservationValue['type'];
    id: string;
    value: number;
};
