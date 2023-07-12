import '../../../components/common/tags.scss';
import 'react-virtualized/styles.css';

import React from 'react';

import teamsIcon from '../../../static/fateams.svg';
import { Button } from '../../../atomic-ui';
import { PageHeader, Section } from '../../../components/common';
import { TeamAdd } from './TeamAdd';
import { TeamList } from './TeamList';

export const Teams: React.FC = () => {
    const [dialog, setDialog] = React.useState(false);
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
                    <img
                        style={{ margin: '-5px -5px 0 0' }}
                        src={teamsIcon}
                        alt={'Teams'}
                    />
                    <h2>Teams</h2>
                    <div style={{ display: 'flex' }}>
                        {/* <Search placeholder="Search all teams" /> */}
                        <div className="filler"></div>
                        <Button onClick={() => setDialog(true)}>
                            add new team
                        </Button>
                    </div>
                </div>
            </PageHeader>
            <TeamAdd show={dialog} onClose={() => setDialog(false)} />
            <Section header="Teams">
                <TeamList />
            </Section>
        </div>
    );
};
