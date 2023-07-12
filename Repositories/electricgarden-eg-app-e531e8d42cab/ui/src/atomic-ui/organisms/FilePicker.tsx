import React, { useCallback } from 'react';

type Props = {
    className?: string;
    acceptExtensions: string[];
    onFilePicked: (file: File) => void;
};

export type FilePickerProps = Props;

export const FilePicker: React.FC<Props> = ({
    className,
    onFilePicked,
    acceptExtensions,
    children,
}) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { files } = e.target;
            if (files && files.length) {
                onFilePicked(files[0]);
            }
        },
        [onFilePicked],
    );

    return (
        <label className={className}>
            {children}
            <input
                type="file"
                accept={acceptExtensions.join(', ')}
                onChange={handleChange}
                style={{ display: 'none' }}
            />
        </label>
    );
};
