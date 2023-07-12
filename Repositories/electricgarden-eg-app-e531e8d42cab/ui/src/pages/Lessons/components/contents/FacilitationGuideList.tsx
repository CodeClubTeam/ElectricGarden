import React from 'react';

import { facilitationGuides } from '../../../../lessons/components/facilitationGuides';
import { FacilitationGuideLinkItem } from './FacilitationGuideLinkItem';
import { List, ListItem } from './List';
import { useCurrentOrganisationMode } from '../../../../hooks';

export const FacilitationGuideList: React.FC = () => {
    const mode = useCurrentOrganisationMode();
    const activeFacilitationGuides = facilitationGuides.filter(
        (g) => Boolean(g.kiosk) === (mode === 'kiosk'),
    );
    if (activeFacilitationGuides.length === 0) {
        return <p>No resources found.</p>;
    }
    return (
        <List>
            {activeFacilitationGuides.map((guide) => (
                <ListItem key={guide.name}>
                    <FacilitationGuideLinkItem metadata={guide} />
                </ListItem>
            ))}
        </List>
    );
};
