import React from 'react';
import { Checkbox } from 'react-bootstrap';

import { VisibleChartItems } from '../actions';

interface Props {
    state: VisibleChartItems;
    onChange: (state: VisibleChartItems) => void;
}

export class CheckboxSection extends React.PureComponent<Props, {}> {
    render() {
        return (
            <div className="checkbox-section">
                <Checkbox
                    onChange={(e) =>
                        this.props.onChange({
                            ...this.props.state,
                            soilTemp: !this.props.state.soilTemp,
                        })
                    }
                    checked={!!this.props.state.soilTemp}
                    style={{
                        color: this.props.state.soilTemp ? '#53B847' : '',
                    }}
                >
                    Soil Temperature (°C)
                </Checkbox>

                <Checkbox
                    onChange={(e) =>
                        this.props.onChange({
                            ...this.props.state,
                            airTemp: !this.props.state.airTemp,
                        })
                    }
                    checked={!!this.props.state.airTemp}
                    style={{ color: this.props.state.airTemp ? '#27A9E1' : '' }}
                >
                    Air Temperature (°C)
                </Checkbox>

                <Checkbox
                    onChange={(e) =>
                        this.props.onChange({
                            ...this.props.state,
                            soilMoisture: !this.props.state.soilMoisture,
                        })
                    }
                    checked={!!this.props.state.soilMoisture}
                    style={{
                        color: this.props.state.soilMoisture ? 'red' : '',
                    }}
                >
                    Soil Moisture (%)
                </Checkbox>

                <Checkbox
                    onChange={(e) =>
                        this.props.onChange({
                            ...this.props.state,
                            humidity: !this.props.state.humidity,
                        })
                    }
                    checked={!!this.props.state.humidity}
                    style={{
                        color: this.props.state.humidity ? '#EC008B' : '',
                    }}
                >
                    Humidity (%)
                </Checkbox>

                <Checkbox
                    onChange={(e) =>
                        this.props.onChange({
                            ...this.props.state,
                            light: !this.props.state.light,
                        })
                    }
                    checked={!!this.props.state.light}
                    style={{ color: this.props.state.light ? '#3c59ff' : '' }}
                >
                    Light (Lux)
                </Checkbox>

                {/* <Checkbox
                onChange={e => this.props.onChange({ ...this.props.state, goldilocks: !this.props.state.goldilocks })}
                checked={!!this.props.state.goldilocks}
                style={{ color: this.props.state.goldilocks ? '#ebb61e' : '' }}>
                Goldilocks<br /> <span className='subtext'> recommended temp</span>
            </Checkbox> */}
            </div>
        );
    }
}
