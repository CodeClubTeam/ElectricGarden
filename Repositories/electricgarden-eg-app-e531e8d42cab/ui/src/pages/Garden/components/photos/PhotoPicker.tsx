import React from 'react';
import styled from 'styled-components/macro';

import { FilePicker, FilePickerProps } from '../../../../atomic-ui/organisms';

type Props = Pick<FilePickerProps, 'onFilePicked'>;

const imageExtensions = ['.jpg', '.jpeg', '.png'];

const ImageFilePicker = styled(FilePicker)`
    position: absolute;
    top: 0.5em;
    left: 0.5em;
    color: ${({ theme }) => theme.btn.primary.fg};
    cursor: pointer;

    :hover {
        color: ${({ theme }) => theme.btn.primary.bg};
    }
`;

export const PhotoPicker: React.FC<Props> = ({ onFilePicked, children }) => (
    <ImageFilePicker
        onFilePicked={onFilePicked}
        acceptExtensions={imageExtensions}
    >
        {children}
    </ImageFilePicker>
);
