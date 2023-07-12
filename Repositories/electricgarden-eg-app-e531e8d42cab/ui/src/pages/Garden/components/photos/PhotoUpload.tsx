import React, { useCallback } from 'react';

import { DropZone } from '../../../../atomic-ui/organisms';
import { usePhotoObservationUploader } from '../../hooks/usePhotoObservationUploader';
import { OverlaidPhotoPicker } from './OverlaidPhotoPicker';

type Props = {
    growable: ServerGrowable;
};

const imageContentTypes = ['image/jpeg', 'image/jpg', 'image/png'];

export const PhotoUpload: React.FC<Props> = ({ growable, children }) => {
    const uploadPhotoObservation = usePhotoObservationUploader();

    const handleFilePicked = useCallback(
        (file: File) => {
            uploadPhotoObservation(growable, file);
        },
        [growable, uploadPhotoObservation],
    );

    return (
        <DropZone
            onFilePicked={handleFilePicked}
            acceptContentTypes={imageContentTypes}
        >
            <OverlaidPhotoPicker onFilePicked={handleFilePicked} />
            {children}
        </DropZone>
    );
};
