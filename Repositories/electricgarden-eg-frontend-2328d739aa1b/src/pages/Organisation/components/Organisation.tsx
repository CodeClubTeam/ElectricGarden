import 'react-virtualized/styles.css';

import React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import Select from 'react-select';
import { ValueType } from 'react-select/lib/types';

import { setCurrentOrganisation } from '../../../actions';
import { PageHeader, Section } from '../../../components/common';
import {
    createAppStructuredSelector,
    currentOrganisationSelector,
    currentUserOrNullSelector,
    rollCheck,
} from '../../../selectors';
import { getSingle, Role, thingToOption } from '../../../utils';
import {
    organisationOptionsSelector,
    organisationsByIdSelector,
    organisationsFetchingSelector,
} from '../selectors';
import OrganisationAdd from './OrganisationAdd';

class Organisation extends React.PureComponent<Props, State> {
    state: State = {
        dialog: false,
    };

    private onOrgChange = (e: ValueType<Tag>) => {
        let orgOption = getSingle(e);
        console.log(orgOption);
        if (!orgOption) {
            return;
        }
        let org = this.props.organisationsById[orgOption.value];
        if (!org) {
            return;
        }

        // TODO: maybe selected org should be in route as well? though it is in db atm, can redirect on start up
        this.props.setCurrentOrganisation(org);
    };

    render() {
        const { organisationOptions } = this.props;
        let currentOrganisationOption =
            this.props.currentOrganisation &&
            thingToOption(this.props.currentOrganisation);
        return (
            <div>
                <PageHeader>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <h2>My Organisation</h2>
                        <div className="filler"></div>
                        {this.props.rollCheck(Role.su) && (
                            <>
                                <div
                                    style={{ width: '300px', margin: '0 40px' }}
                                >
                                    <Select
                                        options={organisationOptions}
                                        value={currentOrganisationOption}
                                        isLoading={
                                            this.props.organisationsFetching
                                        }
                                        onChange={this.onOrgChange}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                backgroundColor: 'white',
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                margin: '1px 0',
                                            }),
                                        }}
                                        components={{
                                            IndicatorSeparator: () => null,
                                        }}
                                    />
                                </div>
                                <Button
                                    onClick={() =>
                                        this.setState({ dialog: true })
                                    }
                                    bsStyle="primary"
                                >
                                    add new organisation
                                </Button>
                            </>
                        )}
                    </div>
                </PageHeader>
                <OrganisationAdd
                    show={this.state.dialog}
                    handleClose={() => this.setState({ dialog: false })}
                />
                <Section header="Organisation details">
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created on</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    {this.props.currentOrganisation &&
                                        this.props.currentOrganisation.name}
                                </td>
                                <td>8th October 2018</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr />
                </Section>
            </div>
        );
    }
}

interface State {
    dialog: boolean;
}

const connector = connect(
    createAppStructuredSelector({
        currentOrganisation: currentOrganisationSelector,
        organisationsById: organisationsByIdSelector,
        organisationOptions: organisationOptionsSelector,
        currentUser: currentUserOrNullSelector,
        rollCheck,
        organisationsFetching: organisationsFetchingSelector,
    }),
    {
        setCurrentOrganisation,
    },
);

type Props = ExtractProps<typeof connector>;

export default connector(Organisation);
