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
import {
    createAppStructuredSelector,
    currentOrganisationIdSelector,
    rollCheck,
} from '../../../selectors';
import { Role, Status } from '../../../utils';
import { fetchUsers } from '../actions';

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
    email: string;
    role: Role;
    submitting: boolean;
}

class UsersAdd extends React.Component<Props, State> {
    private defaultState: State = {
        name: '',
        email: '',
        role: Role.member,
        submitting: false,
    };
    state = this.defaultState;

    private handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            this.setState({ submitting: true });
            await getServer().user.create(
                [
                    {
                        name: this.state.name,
                        email: this.state.email,
                        role: this.state.role,
                        status: Status.active,
                    },
                ],
                this.props.currentOrganisationId,
            );

            this.props.fetchUsers(this.props.currentOrganisationId);
            this.setState(this.defaultState);
            this.props.handleClose();
        } catch (error) {
            // TODO: show to user. via global error handling or in dialog via state
            console.error(error);
        } finally {
            this.setState({ submitting: false });
        }
    };

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add User</Modal.Title>
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
                        <FieldGroup
                            id="formControlsEmail"
                            type="email"
                            label="Email address"
                            placeholder="Enter email"
                            value={this.state.email}
                            onChange={(e) =>
                                this.setState({
                                    email: (e.currentTarget as any).value,
                                })
                            }
                            required={true}
                        />
                        <FormGroup controlId="formControlsRole">
                            <ControlLabel>Role</ControlLabel>
                            <FormControl
                                componentClass="select"
                                onChange={(e) =>
                                    this.setState({
                                        role: (e.currentTarget as any).value,
                                    })
                                }
                                required={true}
                            >
                                <option value={Role.member}>
                                    {Role.member}
                                </option>
                                <option value={Role.leader}>
                                    {Role.leader}
                                </option>
                                {this.props.rollCheck(Role.admin) && (
                                    <option value={Role.admin}>
                                        {Role.admin}
                                    </option>
                                )}
                                {this.props.rollCheck(Role.su) && (
                                    <option value={Role.su}>{Role.su}</option>
                                )}
                            </FormControl>
                        </FormGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <SubmitButton submitting={this.state.submitting}>
                            submit
                        </SubmitButton>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}

const connector = connect(
    createAppStructuredSelector({
        currentOrganisationId: currentOrganisationIdSelector,
        rollCheck,
    }),
    {
        fetchUsers,
    },
);

type Props = OwnProps & ExtractProps<typeof connector>;

export default connector(UsersAdd);
