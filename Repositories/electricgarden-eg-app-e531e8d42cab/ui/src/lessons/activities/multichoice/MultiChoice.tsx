import { shuffle, uniq } from 'lodash-es';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import styled from 'styled-components/macro';

import { Button } from '../../../atomic-ui';
import { useActivityMarker, useActivityStatus } from '../activity';
import { useActivityId } from '../activity/state';
import { ChoiceList } from './ChoiceList';
import { ChoiceItem } from './types';

export type MultiChoiceProps = {
    question: React.ReactNode;
    prompt?: string;
    choices: ChoiceItem[];
    feedback?: {
        allCorrect: string;
        someCorrect: string;
        noneCorrect: string;
        tooMany: string;
        notEnough: string;
    };
    randomise?: boolean;
    submitLabel?: string;
};

const ErrorMessage = styled.p`
    color: red;
`;

const Container = styled.div`
    max-width: 50em;
    margin: 0 auto;
`;

const QuestionContainer = styled.p`
    font-weight: bold;
    font-size: 18px;
`;

const Prompt = styled.p``;

const SubmitContainer = styled.div`
    width: 100%;
    > * {
        margin-left: auto;
        margin-right: 16px;
        display: block;
    }
`;

export const MultiChoice: React.FC<MultiChoiceProps> = ({
    question,
    choices: unsortedChoices,
    prompt,
    feedback,
    submitLabel = 'Submit',
    randomise = true,
}) => {
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [assessing, setAssessing] = useState(true);
    const [isCorrect, setIsCorrect] = useState(false);
    const { pass, fail } = useActivityMarker();
    const { locked } = useActivityStatus();
    const id = useActivityId();

    const choicesRef = useRef<ChoiceItem[]>([]);
    if (choicesRef.current.length !== unsortedChoices.length) {
        choicesRef.current = randomise
            ? shuffle(unsortedChoices)
            : [...unsortedChoices];
    }

    const choices = choicesRef.current;

    const correctChoices = useMemo(() => choices.filter((c) => c.correct), [
        choices,
    ]);

    const handleSubmit = useCallback(() => {
        const correctLabels = correctChoices.map((c) => c.label);
        const correctSelectedLabels = selectedLabels.filter((label) =>
            correctLabels.includes(label),
        );
        if (correctSelectedLabels.length === selectedLabels.length) {
            if (correctSelectedLabels.length === correctLabels.length) {
                pass(feedback?.allCorrect);
                setIsCorrect(true);
            } else {
                fail(feedback?.notEnough);
            }
        } else if (correctSelectedLabels.length > 0) {
            if (selectedLabels.length > correctLabels.length) {
                if (correctSelectedLabels.length === correctLabels.length) {
                    fail(feedback?.tooMany);
                } else {
                    fail(feedback?.someCorrect);
                }
            } else {
                fail(feedback?.someCorrect);
            }
        } else {
            fail(feedback?.noneCorrect);
        }
    }, [correctChoices, fail, feedback, pass, selectedLabels]);

    const handleToggle = useCallback(
        (label: string) => {
            const newSelectedLabels = selectedLabels.includes(label)
                ? selectedLabels.filter((s) => s !== label)
                : [...selectedLabels, label];

            setSelectedLabels(newSelectedLabels);
        },
        [selectedLabels],
    );

    // reset on retry
    useEffect(() => {
        if (!locked) {
            setSelectedLabels([]);
            setAssessing(true);
        } else {
            setAssessing(false);
        }
    }, [locked]);

    useEffect(() => {
        if (
            assessing &&
            selectedLabels.length === correctChoices.length &&
            correctChoices.length === 1
        ) {
            const selectedChoices = choices.filter((c) =>
                selectedLabels.includes(c.label),
            );
            const choice = selectedChoices[0];
            if (correctChoices[0] === choice) {
                pass(choice.feedback);
                setIsCorrect(true);
            } else {
                fail(choice.feedback);
            }
        }
    }, [
        assessing,
        choices,
        correctChoices,
        fail,
        locked,
        pass,
        selectedLabels,
    ]);

    if (!!choices.find((c) => c.label === '')) {
        return <ErrorMessage>Choice labels must not be empty.</ErrorMessage>;
    }

    if (uniq(choices.map((c) => c.label)).length !== choices.length) {
        return <ErrorMessage>Choice labels not unique.</ErrorMessage>;
    }

    if (
        correctChoices.length > 1 &&
        (!feedback || choices.find((c) => c.feedback))
    ) {
        return (
            <ErrorMessage>
                Feedback for multi-select must (only) be specified in top level
                "feedback" property.
            </ErrorMessage>
        );
    }

    return (
        <Container>
            <QuestionContainer>{question}</QuestionContainer>
            {prompt && <Prompt>{prompt}</Prompt>}
            <ChoiceList
                name={`${id}`}
                choices={choices}
                onToggle={handleToggle}
                locked={locked}
                isComplete={!assessing}
                isCorrect={isCorrect}
                selectedLabels={selectedLabels}
            />
            {correctChoices.length > 1 && (
                <SubmitContainer>
                    <Button onClick={handleSubmit}>{submitLabel}</Button>
                </SubmitContainer>
            )}
        </Container>
    );
};
