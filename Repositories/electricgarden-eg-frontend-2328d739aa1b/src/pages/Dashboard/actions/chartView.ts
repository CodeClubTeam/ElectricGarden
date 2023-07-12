import momentPropTypes from 'react-moment-object';
import { createAction } from 'redux-helper';

export const updateChartView = createAction<ChartView>('UPDATE_CHART_VIEW');

export interface ChartView {
    currentSensor?: Tag;
    visibleChartItems: VisibleChartItems;
    dataChartDates: DataChartDates;
    autoPoll?: boolean;
}

export interface VisibleChartItems {
    soilTemp?: boolean;
    airTemp?: boolean;
    soilMoisture?: boolean;
    humidity?: boolean;
    light?: boolean;
    goldilocks?: boolean;
}

export interface DataChartDates {
    startDate?: momentPropTypes.momentObj;
    endDate?: momentPropTypes.momentObj;
    focusedInput?: any;
}
