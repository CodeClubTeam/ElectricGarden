import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { ValueType } from 'react-select/lib/types';

import { sensorOptionsSelector } from '../../pages/Hardware';
import { teamOptionsSelector } from '../../pages/Teams';
import { userOptionsSelector } from '../../pages/Users';
import { AppState } from '../../types';
import { getArray } from '../../utils';

interface Props {
    default?: Tag[];
    options?: Tag[];
}

export default class Tags extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.default || [],
        };
    }

    private handeOnChange = (newTags: ValueType<Tag>) => {
        this.setState({ value: getArray(newTags) });
    };

    render() {
        return (
            <div className="tags-area">
                <Select
                    isMulti
                    isClearable={false}
                    value={this.state.value}
                    options={this.props.options}
                    onChange={this.handeOnChange}
                    styles={{
                        control: (base) => ({
                            ...base,
                            backgroundColor: '#D4EDD1',
                            border: 'none',
                        }),
                        multiValue: (base) => ({
                            ...base,
                            backgroundColor: '#53B848',
                            border: 'none',
                            padding: '5px',
                            borderRadius: '4px',
                            margin: '2px 8px',
                        }),
                        multiValueLabel: (base) => ({
                            ...base,
                            color: 'white',
                        }),
                        menu: (base) => ({ ...base, margin: '1px 0' }),
                        valueContainer: (base) => ({
                            ...base,
                            padding: '10px',
                        }),
                    }}
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                />
            </div>
        );
    }
}

interface State {
    value: Tag[];
}

export const SensorTags = connect((appState: AppState, props: Props) => ({
    options: sensorOptionsSelector(appState),
}))((props: Props) => <Tags {...props} />);

export const TeamTags = connect((appState: AppState, props: Props) => ({
    options: teamOptionsSelector(appState),
}))((props: Props) => <Tags {...props} />);

export const UserTags = connect((appState: AppState, props: Props) => ({
    options: userOptionsSelector(appState),
}))((props: Props) => <Tags {...props} />);
