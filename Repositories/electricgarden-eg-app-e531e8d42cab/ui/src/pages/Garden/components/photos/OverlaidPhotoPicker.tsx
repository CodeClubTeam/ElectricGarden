import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components/macro';

import { FilePickerProps } from '../../../../atomic-ui/organisms';
import { PhotoPicker } from './PhotoPicker';

type Props = Pick<FilePickerProps, 'onFilePicked'>;

const Container = styled.div`
    position: relative;
`;

export const OverlaidPhotoPicker: React.FC<Props> = ({ onFilePicked }) => (
    <Container>
        <PhotoPicker onFilePicked={onFilePicked}>
            <FontAwesomeIcon icon={faCamera} size="2x" />
        </PhotoPicker>
    </Container>
);
