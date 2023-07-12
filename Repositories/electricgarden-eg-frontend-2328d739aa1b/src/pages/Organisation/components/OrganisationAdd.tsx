import React from 'react';
import {
    ControlLabel,
    FormControl,
    FormGroup,
    HelpBlock,
    Modal,
} from 'react-bootstrap';
import { connect } from 'react-redux';

import { SubmitButton } from '../../../components/common';
import getServer from '../../../data/server';
import { fetchOrganisations } from '../actions';

interface OwnProps {
    handleClose: () => void;
    show: boolean;
}

function FieldGroup({
    id,
    label,
    help,
    ...props
}: {
    id: string;
    label: string;
    help?: string;
} & FormControl.FormControlProps) {
    return (
        <FormGroup controlId={id}>
            <ControlLabel>{label}</ControlLabel>
            <FormControl {...props} />
            {help && <HelpBlock>{help}</HelpBlock>}
        </FormGroup>
    );
}

interface State {
    name: string;
    line1: string;
    line2: string;
    line3: string;
    postcode: string;
    country: string;
    saveInProgress: boolean;
}

class OrganisationAdd extends React.Component<Props, State> {
    private defaultState: State = {
        name: '',
        line1: '',
        line2: '',
        line3: '',
        postcode: '',
        country: 'New Zealand',
        saveInProgress: false,
    };
    state = this.defaultState;

    private handleSubmit = async (e: React.FormEvent) => {
        console.log(e, this.state);
        e.preventDefault();
        const { name, line1, line2, line3, postcode, country } = this.state;
        const org: CreateOrganisation = {
            name,
            address: {
                line1,
                line2,
                line3,
                postcode,
                country,
            },
        };

        try {
            this.setState({ saveInProgress: true });
            await getServer().organisation.create([org]);

            this.props.fetchOrganisations();
            this.setState(this.defaultState);
            this.props.handleClose();
        } catch (error) {
            // TODO: show to user. via global error handling or in dialog via state
            console.error(error);
        } finally {
            this.setState({ saveInProgress: false });
        }
    };

    render() {
        const { saveInProgress } = this.state;
        return (
            <Modal show={this.props.show} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Organisation</Modal.Title>
                </Modal.Header>
                <form onSubmit={this.handleSubmit}>
                    <Modal.Body>
                        <FieldGroup
                            id="formControlsName"
                            type="text"
                            label="Name"
                            placeholder="Enter name"
                            value={this.state.name}
                            onChange={(e) =>
                                this.setState({
                                    name: (e.currentTarget as any).value,
                                })
                            }
                            required={true}
                        />

                        <h3>Address</h3>

                        <FieldGroup
                            id="formControlsAddressLine1"
                            type="text"
                            label="Line 1"
                            value={this.state.line1}
                            onChange={(e) =>
                                this.setState({
                                    line1: (e.currentTarget as any).value,
                                })
                            }
                        />
                        <FieldGroup
                            id="formControlsAddressLine2"
                            type="text"
                            label="Line 2"
                            value={this.state.line2}
                            onChange={(e) =>
                                this.setState({
                                    line2: (e.currentTarget as any).value,
                                })
                            }
                        />
                        <FieldGroup
                            id="formControlsAddressLine3"
                            type="text"
                            label="Line 3"
                            value={this.state.line3}
                            onChange={(e) =>
                                this.setState({
                                    line3: (e.currentTarget as any).value,
                                })
                            }
                        />
                        <FieldGroup
                            id="formControlsPostcode"
                            type="text"
                            label="Postcode"
                            value={this.state.postcode}
                            onChange={(e) =>
                                this.setState({
                                    postcode: (e.currentTarget as any).value,
                                })
                            }
                        />
                        <FieldGroup
                            id="formControlsCountry"
                            type="text"
                            label="Country"
                            value={this.state.country}
                            onChange={(e) =>
                                this.setState({
                                    country: (e.currentTarget as any).value,
                                })
                            }
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <SubmitButton submitting={saveInProgress}>
                            submit
                        </SubmitButton>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}

const connector = connect(
    undefined,
    {
        fetchOrganisations,
    },
);

type Props = OwnProps & ExtractProps<typeof connector>;

export default connector(OrganisationAdd);
