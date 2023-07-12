import 'react-virtualized/styles.css';

import React from 'react';
import { useSelector } from 'react-redux';

import { Button } from '../../../atomic-ui';
import { PageHeader, Section } from '../../../components/common';
import { useCanHaveRole } from '../../../hooks';
import { currentOrganisationSelector } from '../../../selectors';
import myOrganisationIcon from '../../../static/faorganisation.svg';
import { Role } from '../../../utils';
import { OrganisationAdd } from './OrganisationAdd';
import { OrganisationSwitcher } from './OrganisationSwitcher';
import { OrganisationDeleteButton } from './OrganisationDeleteButton';
import { OrganisationEdit } from './OrganisationEdit';
import { OrganisationView } from './OrganisationView';

export const Organisation: React.FC = () => {
    const [adding, setAdding] = React.useState(false);
    const [editing, setEditing] = React.useState(false);
    const organisation = useSelector(currentOrganisationSelector);
    const canHaveRole = useCanHaveRole();

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
                    {' '}
                    <img
                        style={{ margin: '-5px -5px 0 0' }}
                        src={myOrganisationIcon}
                        alt={'My Organisation'}
                    />
                    <h2>My Organisation</h2>
                    <div className="filler"></div>
                    {canHaveRole(Role.su) && (
                        <>
                            <OrganisationSwitcher />
                            <Button onClick={() => setAdding(true)}>
                                add new organisation
                            </Button>
                        </>
                    )}
                </div>
            </PageHeader>
            <OrganisationAdd show={adding} onClose={() => setAdding(false)} />
            <OrganisationEdit
                organisation={organisation}
                show={editing}
                onClose={() => setEditing(false)}
            />
            <Section header="Organisation details">
                <OrganisationView organisation={organisation} />
                <hr />
                {canHaveRole(Role.su) && (
                    <>
                        <Button onClick={() => setEditing(true)}>edit</Button>
                    </>
                )}
                {process.env.NODE_ENV !== 'production' &&
                    canHaveRole(Role.su) && (
                        <OrganisationDeleteButton organisation={organisation} />
                    )}
            </Section>
        </div>
    );
};
