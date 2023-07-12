import React from 'react';
import styled from 'styled-components/macro';

import { formatFriendlyDateTime } from '../../../../utils';
import { PhotographedEvent } from '../../types';
import { PhotoPlaceholder } from './PhotoPlaceholder';

const PrimaryImageContainer = styled.div`
    img {
        width: 100%;
    }
`;

type Props = {
    observation?: ServerObservation<PhotographedEvent>;
    thumbnail?: boolean;
    readOnly?: boolean;
};

const Photo: React.FC<{
    observation?: ServerObservation<PhotographedEvent>;
    readOnly?: boolean;
}> = ({ observation, readOnly }) => {
    if (!observation) {
        return <PhotoPlaceholder readOnly={readOnly} />;
    }
    // Options for image signed urls:
    // 1. Have server supply url with observation value. It expires so re-requests by browser may not work
    // 2. Fetch each time. Slower (2x round trips, via azure function)
    // 3. Get SAS token for container and generate each url on client (slight security issue as access to any images know id of)
    //
    // For now have a 24 hour expiry. We could make browser refresh entire page before 24 hours I guess!
    //
    // const [url, setUrl] = React.useState<string>();
    // const api = useApi();
    // api.assets.getUrl(assetId).then((url) => setUrl(url));
    // if (!url) {
    //     return null;
    // }

    const {
        value: { url },
        recordedBy,
        recordedOn,
    } = observation;
    const tooltip = `Uploaded by ${recordedBy.name} ${formatFriendlyDateTime(
        recordedOn,
    )}`;
    return <img src={url} alt={tooltip} title={tooltip} />;
};

export const PhotoObservation: React.FC<Props> = ({
    observation,
    thumbnail,
    readOnly,
}) =>
    thumbnail ? (
        <Photo observation={observation} readOnly={readOnly} />
    ) : (
        <PrimaryImageContainer>
            <Photo observation={observation} readOnly={readOnly} />
        </PrimaryImageContainer>
    );
