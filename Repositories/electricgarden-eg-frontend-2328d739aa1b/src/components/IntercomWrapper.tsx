import React from 'react';
import Intercom from 'react-intercom';
import { connect } from 'react-redux';

import {
    createAppStructuredSelector,
    currentOrganisationSelector,
    currentUserOrNullSelector,
} from '../selectors';

class IntercomWrapper extends React.Component<Props, {}> {
    render() {
        let user = {};
        if (this.props.currentUser) {
            user = {
                user_id: this.props.currentUser.id,
                email: this.props.currentUser.email,
                name: this.props.currentUser.name,
                role: this.props.currentUser.role,
                status: this.props.currentUser.status,
                company: this.props.currentOrganisation && {
                    id: this.props.currentOrganisation.id,
                    name: this.props.currentOrganisation.name,
                },
                created_at: Date.now(),
            };
        }

        return <Intercom appID="sah6cfv2" {...user} />;
    }
}

const connector = connect(
    createAppStructuredSelector({
        currentUser: currentUserOrNullSelector,
        currentOrganisation: currentOrganisationSelector,
    }),
);

type Props = ExtractProps<typeof connector>;

export default connector(IntercomWrapper);
