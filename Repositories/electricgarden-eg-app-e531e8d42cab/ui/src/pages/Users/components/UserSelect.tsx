import React from 'react';

type Props = {
    selected: boolean;
    onSelectedChanged: (selected: boolean) => void;
};

export const UserSelect = ({ selected, onSelectedChanged }: Props) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectedChanged(e.target.checked);
    };

    return <input type="checkbox" checked={selected} onChange={handleChange} />;
};
