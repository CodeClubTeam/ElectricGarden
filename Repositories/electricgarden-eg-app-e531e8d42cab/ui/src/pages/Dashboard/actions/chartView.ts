import { createAction } from 'redux-helper';

import { VisibleChartItems } from '../../../atomic-ui/organisms';

export const updateChartView = createAction<ChartView>('UPDATE_CHART_VIEW');

export interface ChartView {
    currentSensor?: Sensor;
    visibleChartItems: VisibleChartItems;
    dataChartDates: NullableDateRange;
    autoPoll?: boolean;
}
