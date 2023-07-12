import React, { useCallback, useState } from 'react';
import styled from 'styled-components/macro';

interface Props {
    acceptContentTypes?: string[];
    onFilePicked: (file: File) => void;
}

const DropContainer = styled(
    ({
        over,
        ...props
    }: { over: boolean } & React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >) => <div {...props} />,
)`
    opacity: ${({ over }) => (over ? 0.5 : 1)};
`;

export const DropZone: React.FC<Props> = ({
    onFilePicked,
    children,
    acceptContentTypes,
}) => {
    const [over, setOver] = useState(false);

    const isAcceptableFile = useCallback(
        (file?: File) =>
            file &&
            (!acceptContentTypes || acceptContentTypes.includes(file.type)),
        [acceptContentTypes],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setOver(false);
            const { files } = e.dataTransfer;
            if (files && files.length) {
                const file = files[0];
                if (isAcceptableFile(file)) {
                    onFilePicked(file);
                }
            }
        },
        [isAcceptableFile, onFilePicked],
    );

    const handleDragOverOrEnd = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
        },
        [],
    );

    const handleDragLeave = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setOver(false);
        },
        [],
    );

    const handleDragEnter = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            // can't seem to find out file type until it is dropped
            const { types } = e.dataTransfer;
            if (types.indexOf('Files') > -1) {
                setOver(true);
            }
        },
        [],
    );

    return (
        <DropContainer
            over={over}
            onDrop={handleDrop}
            onDragOver={handleDragOverOrEnd}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragOverOrEnd}
        >
            {children}
        </DropContainer>
    );
};
