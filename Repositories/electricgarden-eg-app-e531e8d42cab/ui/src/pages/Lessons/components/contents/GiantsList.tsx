import React from 'react';

import { giantsGuides } from '../../../../lessons/components/giantsGuides';
import { GiantsGuideLinkItem } from './GiantsGuideLinkItem';
import { List, ListItem } from './List';

export const GiantsListTerm1: React.FC = () => {
    const activeGiantsGuides = giantsGuides.filter((g) => g.term === 1);
    if (activeGiantsGuides.length === 0) {
        return (
            <h1 style={{ textAlign: 'center', margin: '2em' }}>Coming Soon!</h1>
        );
    }
    return (
        <List>
            {activeGiantsGuides.map((guide) => (
                <ListItem key={guide.name}>
                    <GiantsGuideLinkItem metadata={guide} />
                </ListItem>
            ))}
        </List>
    );
};

export const GiantsListTerm4: React.FC = () => {
    const activeGiantsGuides = giantsGuides.filter((g) => g.term === 4);
    if (activeGiantsGuides.length === 0) {
        return <p>No resources found.</p>;
    }
    return (
        <List>
            {activeGiantsGuides.map((guide) => (
                <ListItem key={guide.name}>
                    <GiantsGuideLinkItem metadata={guide} />
                </ListItem>
            ))}
        </List>
    );
};
