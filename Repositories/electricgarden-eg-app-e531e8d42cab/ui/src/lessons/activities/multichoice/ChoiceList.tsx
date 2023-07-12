import React from 'react';
import styled from 'styled-components/macro';

import { Choice } from './Choice';
import { ChoiceContent } from './ChoiceContent';
import { ChoiceItem } from './types';

const List = styled.ul`
    list-style-image: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
`;

type ListProps = {
    isComplete: boolean;
    isCorrect: boolean;
};

const ListItem = styled.li<ListProps>`
    --margin: 0.5em;
    display: block;
    margin: var(--margin);
    transition: all 0.1s ease-in-out;
    --border-radius: 10px;
    flex: 1 calc(50% - 4 * var(--margin)); /* multi-column uniformity (horizontal only. how to do vertical?).  */
    --container-color: ${({ isCorrect, isComplete }) =>
        isComplete ? (isCorrect ? '#a2f5a1' : '#ff6060') : '#a7a7a7'};
    --background-color: ${({ isCorrect, isComplete }) =>
        isComplete ? (isCorrect ? '#e0e0e0' : '#ff6060') : '#e0e0e0'};
    --dot-color: ${({ isCorrect, isComplete }) =>
        isComplete ? (isCorrect ? '#009d00' : '#a4000a') : '#222222'};
`;

type Props = {
    name: string;
    choices: ChoiceItem[];
    selectedLabels: string[];
    onToggle: (label: string) => void;
    locked?: boolean;
    isComplete: boolean;
    isCorrect: boolean;
};

export const ChoiceList: React.FC<Props> = ({
    name,
    choices,
    selectedLabels,
    onToggle,
    locked,
    isComplete,
    isCorrect,
}) => {
    return (
        <List>
            {choices.map(({ label, image }) => {
                const selected = selectedLabels.includes(label);
                return (
                    <ListItem
                        key={label}
                        isComplete={isComplete}
                        isCorrect={isCorrect}
                    >
                        <Choice
                            group={name}
                            name={label}
                            selected={selected}
                            disabled={locked}
                            onToggle={() => onToggle(label)}
                        >
                            <ChoiceContent selected={selected}>
                                {image ? (
                                    <img
                                        src={image}
                                        alt={label}
                                        title={label}
                                    />
                                ) : (
                                    label
                                )}
                            </ChoiceContent>
                        </Choice>
                    </ListItem>
                );
            })}
        </List>
    );
};
