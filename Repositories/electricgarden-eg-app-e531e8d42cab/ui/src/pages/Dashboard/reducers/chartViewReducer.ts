import moment from 'moment';
import { Reducer } from 'redux';

import { ChartView, updateChartView } from '../actions';

let defaultChartView: ChartView = {
    visibleChartItems: {
        soilTemp: true,
        airTemp: true,
        soilMoisture: true,
        humidity: false,
        light: false,
    },
    dataChartDates: {
        startDate: moment().subtract(30, 'days'),
        endDate: null,
    },
    currentSensor: undefined,
};

export const chartViewReducer: Reducer<ChartView> = (
    state = defaultChartView,
    action,
) => {
    if (updateChartView.matchAction(action)) {
        return action.payload;
    }
    return state;
};
