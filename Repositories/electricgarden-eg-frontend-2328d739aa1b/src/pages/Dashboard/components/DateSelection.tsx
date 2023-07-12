import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

import moment from 'moment';
import React from 'react';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';

import { DataChartDates } from '../actions';

interface Props {
    state: DataChartDates;
    onChange: (state: DataChartDates) => void;
}

export class DateSelection extends React.PureComponent<Props, {}> {
    render() {
        return (
            <div className="date-section">
                <div className="date-section-container">
                    <p>Select Data Date Range:</p>
                    <DateRangePicker
                        isOutsideRange={(day) =>
                            !isInclusivelyBeforeDay(day, moment())
                        }
                        startDate={this.props.state.startDate} // momentPropTypes.momentObj or null,
                        startDateId="startDateIdChart" // PropTypes.string.isRequired,
                        endDate={this.props.state.endDate} // momentPropTypes.momentObj or null,
                        endDateId="endDateIdChart" // PropTypes.string.isRequired,
                        onDatesChange={({ startDate, endDate }) =>
                            this.props.onChange({
                                ...this.props.state,
                                startDate,
                                endDate,
                                focusedInput:
                                    this.props.state.focusedInput ===
                                    'startDate'
                                        ? 'endDate'
                                        : null,
                            })
                        } // PropTypes.func.isRequired,  focusedInput: (this.props.state.focusedInput === 'startDate') ? "endDate" : null}
                        focusedInput={this.props.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                        onFocusChange={(focusedInput) =>
                            this.props.onChange({
                                ...this.props.state,
                                focusedInput,
                            })
                        } // PropTypes.func.isRequired,
                        displayFormat="D/MM/YYYY"
                        hideKeyboardShortcutsPanel
                        readOnly={true}
                    />
                </div>
            </div>
        );
    }
}
