import Papa from 'papaparse';
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { AutoSizer, Column, Table } from 'react-virtualized';

import {
    DropZone,
    ErrorBox,
    PageHeader,
    Section,
} from '../../../components/common';
import getServer from '../../../data/server';
import {
    createAppStructuredSelector,
    currentOrganisationIdSelector,
    rollCheck,
} from '../../../selectors';
import exampleFile from '../../../static/example.csv';
import { Role, Status } from '../../../utils';
import { fetchUsers } from '../actions';
import { usersSelector } from '../selectors';
import UserAdd from './UserAdd';

class Users extends React.Component<Props, State> {
    state: State = {
        import: false,
        dialog: false,
        importing: false,
    };

    private importCsv = async (file: File) => {
        const { currentOrganisationId: currentOrganisation } = this.props;
        try {
            this.setState({ importing: true });
            const users = await grabUsers(file);
            await getServer().user.create(users, currentOrganisation);
            await this.props.fetchUsers(currentOrganisation);
        } finally {
            this.setState({ import: false, importing: false });
        }
    };

    private handleFilePicked = (file: File) => {
        this.importCsv(file).catch((error) => {
            console.error(error);
        });
    };

    render() {
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
                        <div style={{ flex: 1 }}>
                            <h2>
                                {this.state.import ? 'Add new user' : 'Users'}
                            </h2>
                            {this.state.import ? (
                                <div
                                    style={{
                                        flex: 2,
                                        textAlign: 'center',
                                        minWidth: '400px',
                                    }}
                                >
                                    <DropZone
                                        className="user-drop-zone"
                                        onFilePicked={this.handleFilePicked}
                                    />
                                    <a
                                        download="example.csv"
                                        href={exampleFile}
                                    >
                                        view sample file
                                    </a>
                                </div>
                            ) : (
                                <>
                                    {this.state.error && (
                                        <ErrorBox>{this.state.error}</ErrorBox>
                                    )}
                                    <div className="filler"></div>
                                </>
                            )
                            // <Search placeholder='Search all users' />
                            }
                        </div>
                        {this.props.rollCheck(Role.leader) && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textAlign: 'center',
                                }}
                            >
                                <Button
                                    onClick={() =>
                                        this.setState({
                                            dialog: true,
                                            error: undefined,
                                        })
                                    }
                                    style={{ width: '200px' }}
                                    bsStyle="primary"
                                    disabled={this.state.importing}
                                >
                                    {this.state.import
                                        ? this.state.importing
                                            ? 'importing...'
                                            : 'import'
                                        : 'add new user'}
                                </Button>
                                <div
                                    onClick={() =>
                                        this.setState({
                                            import: !this.state.import,
                                        })
                                    }
                                    style={{
                                        color: '#EC008C',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                    }}
                                >
                                    {this.state.import
                                        ? '< go back'
                                        : 'import csv file'}
                                </div>
                            </div>
                        )}
                    </div>
                </PageHeader>
                <UserAdd
                    show={this.state.dialog}
                    handleClose={() => this.setState({ dialog: false })}
                />

                <Section header="Users">
                    <div className="user-grid-header">
                        {/* <DropdownButton title="Export" bsStyle='info' id='user-export'>
                            <MenuItem eventKey="1">Selected</MenuItem>
                            <MenuItem eventKey="2">All</MenuItem>
                        </DropdownButton>
                        <DropdownButton title="Actions" bsStyle='info' id='user-actions'>
                            <MenuItem eventKey="1">Add to team</MenuItem>
                            <MenuItem eventKey="2">Remove from team</MenuItem>
                            <MenuItem eventKey="3">Edit details</MenuItem>
                            <MenuItem divider />
                            <MenuItem eventKey="4">Delete</MenuItem>
                        </DropdownButton> */}
                    </div>
                    <div style={{ height: '600px' }}>
                        <MediaQuery minDeviceWidth={800}>
                            {(desktop) => (
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <Table
                                            width={width}
                                            height={height}
                                            headerHeight={28}
                                            rowHeight={47}
                                            rowCount={this.props.users.length}
                                            sortBy="name"
                                            rowGetter={({ index }) =>
                                                this.props.users[index]
                                            }
                                        >
                                            {/* <Column width={40} label='&nbsp;' dataKey='' cellRenderer={e => <input type='checkbox' />} /> */}
                                            <Column
                                                label="Name"
                                                dataKey="name"
                                                width={200}
                                                cellRenderer={(e) => (
                                                    <Link
                                                        to={`/users/${e.rowData.id}/`}
                                                    >
                                                        {e.cellData}
                                                    </Link>
                                                )}
                                            />
                                            <Column
                                                width={300}
                                                label="Email"
                                                dataKey="email"
                                                cellRenderer={(e) => (
                                                    <a
                                                        href={`mailto:${e.cellData}`}
                                                    >
                                                        {e.cellData}
                                                    </a>
                                                )}
                                            />
                                            {desktop && (
                                                <Column
                                                    width={300}
                                                    label="Role"
                                                    dataKey="role"
                                                    cellDataGetter={(e) =>
                                                        e.rowData[e.dataKey]
                                                    }
                                                />
                                            )}
                                            {/* <Column width={300} label='Teams' dataKey='teams' cellDataGetter={e => {
                                        let teams = (e.rowData as User).teams.map(team => team.name).join(', ');
                                        return teams || '\xa0';
                                    }} /> */}
                                            {/* <Column width={300} label='Date Added' dataKey='date' /> */}
                                            {desktop && (
                                                <Column
                                                    width={300}
                                                    label="Status"
                                                    dataKey="status"
                                                    cellDataGetter={(e) =>
                                                        e.rowData[e.dataKey]
                                                    }
                                                />
                                            )}
                                            {/* <Column width={40} label='&nbsp;' dataKey='email' cellRenderer={e => <img src={trashIcon} />} /> */}
                                        </Table>
                                    )}
                                </AutoSizer>
                            )}
                        </MediaQuery>
                    </div>
                </Section>
            </div>
        );
    }
}

interface State {
    import: boolean;
    dialog: boolean;
    error?: string;
    importing: boolean;
}

const fields = {
    email: ['email', 'email address', 'address', 'e-mail', 'e-mail address'],
    name: [
        'name',
        'first name',
        'username',
        'user name',
        'fullname',
        'full name',
    ],
    role: ['role', 'level', 'permissions', 'rank'],
};

function findHeader(headers: string[], b: string[]) {
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase().trim();
        if (b.indexOf(header) > -1) {
            return i;
        }
    }
    return false;
}

function parse(file: File) {
    return new Promise<Papa.ParseResult>((resolve, reject) => {
        Papa.parse(file, {
            complete: (results) => {
                resolve(results);
            },
        });
    });
}

async function grabUsers(file: File) {
    const results = await parse(file);
    if (!results.data.length || !results.data[0].length) {
        throw new Error('No data');
    }
    let headers = results.data[0];
    const email = findHeader(headers, fields.email);
    const name = findHeader(headers, fields.name);
    const role = findHeader(headers, fields.role);

    let errors = [];
    if (email === false) {
        errors.push('Could not find an "email address" column');
    }
    if (name === false) {
        errors.push('Could not find a "name" column');
    }
    if (email === false || name === false) {
        throw new Error(errors.join('\n'));
    }

    let users: ServerUpdateUser[] = [];
    for (let i = 1; i < results.data.length; i++) {
        const row = results.data[i];
        users.push({
            name: row[name],
            email: row[email],
            role: role !== false ? row[role] : Role.member,
            status: Status.active,
        });
    }

    return users;
}

const connector = connect(
    createAppStructuredSelector({
        users: usersSelector,
        // teams: appState.teams,
        rollCheck,
        currentOrganisationId: currentOrganisationIdSelector,
    }),
    {
        fetchUsers,
    },
);

type Props = ExtractProps<typeof connector>;

export default connector(Users);
