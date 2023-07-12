import React from 'react';
import { connect } from 'react-redux';
import {
    currentOrganisationSelector,
    createAppStructuredSelector,
} from '../selectors';

const Component: React.FC<Props> = ({ currentOrganisation }) => (
    <div className="header-org">
        {currentOrganisation && currentOrganisation.name}
    </div>
);

const connector = connect(
    createAppStructuredSelector({
        currentOrganisation: currentOrganisationSelector,
    }),
);

type Props = ExtractProps<typeof connector>;

export const CurrentOrganisationName = connector(Component);
