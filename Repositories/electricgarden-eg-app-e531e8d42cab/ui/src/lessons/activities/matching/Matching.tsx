import React, {
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
} from 'react';
import { flatMap, difference, flatten } from 'lodash-es';
import seededshuffle from 'seededshuffle';
import styled, { css } from 'styled-components/macro';
import { TargetDroppable, TargetDroppableProps } from './TargetDroppable';
import { useActivityMarker, useActivityStatus } from '../activity';
import { MatchTargetProps, Position } from './MatchTarget';
import { MatchRemove } from './MatchRemove';
import { CandidateContainer } from './CandidateContainer';
import { Draggable } from './Draggable';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';

type Direction = 'right' | 'left' | 'up' | 'down';

export type MatchingProps = {
    children:
        | React.ReactElement<MatchTargetProps>[]
        | React.ReactElement<MatchTargetProps>;
    unmatched?: React.ReactElement<any>[];
    feedback?: {
        success?: string;
        fail?: string;
    };
    question?: React.ReactNode;
    direction?: {
        sets?: Direction;
        candidates?: Direction;
        targets?: Direction;
        matches?: Direction;
    };
    positions?: {
        candidates?: Position;
        targets?: Position;
    };
    backgroundColor?: string;
    background?: React.ReactNode;
    columns?: number;
    targetStyles?: TargetDroppableProps['styles'];
    randomOrder?: {
        candidates?: boolean;
        targets?: boolean;
    };
    mode?: 'sets' | 'select';
};

type LayoutProps = {
    background?: string;
    direction?: Direction;
    isComplete?: boolean;
} & React.HTMLProps<HTMLDivElement>;

type PositionableLayoutProps = LayoutProps & {
    position?: Position;
};

const flexDirRightCss = css`
    flex-direction: row;
    flex-wrap: nowrap;
    align-self: center;
`;

const flexDirDownCss = css`
    flex-direction: column;
`;

const flexDirLeftCss = css`
    flex-direction: row-reverse;
    justify-content: flex-end;
`;

const flexDirUpCss = css`
    flex-direction: column-reverse;
    justify-content: flex-end;
`;

const QuestionContainer = styled.p`
    font-weight: bold;
`;

const Container = styled(({ direction, ...props }: LayoutProps) => (
    <div {...props} />
))`
    display: flex;
    ${({ direction }) => direction === 'right' && flexDirRightCss}
    ${({ direction }) => direction === 'left' && flexDirLeftCss}
    ${({ direction }) => direction === 'down' && flexDirDownCss}
    ${({ direction }) => direction === 'up' && flexDirUpCss}
`;

const BackgroundContainer = styled.div``;

const TargetsContainer = styled(
    ({ direction, position, ...props }: PositionableLayoutProps) => (
        <div {...props} />
    ),
)`
    position: relative; /* needed for any positioning of match targets */
    display: flex;
    flex-wrap: wrap;
    margin: 0 auto;
    ${({ direction }) => direction === 'right' && flexDirRightCss}
    ${({ direction }) => direction === 'left' && flexDirLeftCss}
    ${({ direction }) => direction === 'down' && flexDirDownCss}
    ${({ direction }) => direction === 'up' && flexDirUpCss}
    ${({ position: p }) =>
        p &&
        css`
            position: absolute;
            z-index: 1;
            ${p.top && `top: ${p.top}px`};
            ${p.right && `right: ${p.right}px`};
            ${p.bottom && `bottom: ${p.bottom}px`};
            ${p.left && `left: ${p.left}px`};
        `}
`;

const CandidatesContainer = styled(
    ({ direction, position, ...props }: PositionableLayoutProps) => (
        <div {...props} />
    ),
)`
    display: flex;
    flex-wrap: wrap;

    ${({ direction }) => direction === 'right' && flexDirRightCss}
    ${({ direction }) => direction === 'left' && flexDirLeftCss}
    ${({ direction }) => direction === 'down' && flexDirDownCss}
    ${({ direction }) => direction === 'up' && flexDirUpCss}
    ${({ position: p }) =>
        p &&
        css`
            position: absolute;
            z-index: 1;
            ${p.top && `top: ${p.top}px`};
            ${p.right && `right: ${p.right}px`};
            ${p.bottom && `bottom: ${p.bottom}px`};
            ${p.left && `left: ${p.left}px`};
        `}
`;

const CandidateDraggable = styled(Draggable)`
    ${({ enabled }) =>
        enabled &&
        css`
            &:hover {
                cursor: grab;
                opacity: 0.5;
            }
        `}
`;

const TargetContainer = styled.div<LayoutProps>`
    display: flex;
    flex-wrap: wrap;
    --match-color: ${({ isComplete }) => (isComplete ? 'inherit' : '#ec008c')};
    margin: 0 0.25em;

    ${({ direction }) => direction === 'right' && flexDirRightCss}
    ${({ direction }) => direction === 'left' && flexDirLeftCss}
    ${({ direction }) => direction === 'down' && flexDirDownCss}
    ${({ direction }) => direction === 'up' && flexDirUpCss}
    justify-content: space-between;
    //align-content: space-between;
`;

export const Matching: React.FC<MatchingProps> = ({
    children,
    unmatched = [],
    question,
    feedback = {},
    direction = {},
    positions = {},
    background,
    backgroundColor,
    columns,
    targetStyles,
    randomOrder,
    mode = 'select',
}) => {
    const candidatesRandomSeed = useRef(1);
    if (candidatesRandomSeed.current === 1) {
        candidatesRandomSeed.current = Math.random();
    }
    const targetsRandomSeed = useRef(1);
    if (targetsRandomSeed.current === undefined) {
        targetsRandomSeed.current = Math.random();
    }
    const [matchIndexes, setMatchIndexes] = useState<number[][]>([]);
    const { pass, fail } = useActivityMarker();
    const { locked } = useActivityStatus();

    const matchTargets = React.Children.toArray(
        children,
    ) as React.ReactElement<MatchTargetProps>[];

    const matches = useMemo(
        () => flatMap(matchTargets, (target) => target.props.matches),
        [matchTargets],
    );

    const candidates = useMemo(() => {
        const allCandidates = [...unmatched, ...matches];
        return randomOrder?.candidates
            ? seededshuffle.shuffle(allCandidates, candidatesRandomSeed.current)
            : allCandidates;
    }, [matches, randomOrder, unmatched]);

    const selectedCandidateIndexes = useMemo(
        () => flatten(Object.values(matchIndexes)),
        [matchIndexes],
    );

    // reset on retry
    useEffect(() => {
        if (!locked) {
            setIsComplete(false);
            setMatchIndexes([]);
        }
    }, [locked]);

    const handleDrop = useCallback(
        (targetIndex: number, candidateIndex: number) => {
            setIsDragging(false);
            if (mode === 'select') {
                const toBeMatched =
                    matchTargets[targetIndex].props.matches.length;
                if ((matchIndexes[targetIndex] ?? []).length === toBeMatched) {
                    return;
                }
            }
            const newMatchIndexes = [...matchIndexes];

            newMatchIndexes[targetIndex] = [
                ...(newMatchIndexes[targetIndex] ?? []),
                candidateIndex,
            ];
            setMatchIndexes(newMatchIndexes);

            const matchedCandidateCount = newMatchIndexes
                .flat()
                .filter((i) => i !== undefined).length;
            const maxCorrectMatchCount = matchTargets.flatMap(
                ({ props: { matches } }) => matches,
            ).length;
            const completed = matchedCandidateCount === maxCorrectMatchCount;
            if (completed) {
                const allCandidatesCorrectMatches = !matchTargets.find(
                    (matchTarget, index) => {
                        const matchedIndexes = newMatchIndexes[index] ?? [];
                        const matchedCandidates = matchedIndexes.map(
                            (mi) => candidates[mi],
                        );
                        const targetMatches = matchTarget.props.matches;
                        return (
                            difference(matchedCandidates, targetMatches)
                                .length !== 0
                        );
                    },
                );
                setIsComplete(true);
                if (allCandidatesCorrectMatches) {
                    pass(feedback?.success ?? 'Correct');
                } else {
                    fail(feedback?.fail ?? 'Incorrect');
                }
            }
        },
        [candidates, fail, feedback, matchIndexes, matchTargets, mode, pass],
    );

    const handleRemoveMatch = useCallback(
        (targetIndex: number, index: number) => {
            const newMatchIndexes = [...matchIndexes];
            newMatchIndexes[targetIndex] = newMatchIndexes[targetIndex].filter(
                (o) => o !== index,
            );
            setMatchIndexes(newMatchIndexes);
        },
        [matchIndexes],
    );

    const getSelectedCandidates = useCallback(
        (targetIndex: number): React.ReactNode => {
            const candidateIndexes = matchIndexes[targetIndex] ?? [];
            if (candidateIndexes.length === 0) {
                return null;
            }
            return candidateIndexes.map((index) => {
                const candidate = candidates[index];
                const key = `${targetIndex}-${index}`;
                if (locked) {
                    return (
                        <CandidateContainer key={key}>
                            {candidate}
                        </CandidateContainer>
                    );
                }
                return (
                    <CandidateContainer key={key}>
                        <MatchRemove
                            onClick={() =>
                                handleRemoveMatch(targetIndex, index)
                            }
                        >
                            {candidate}
                        </MatchRemove>
                    </CandidateContainer>
                );
            });
        },
        [candidates, handleRemoveMatch, locked, matchIndexes],
    );

    const isCandidateSelected = (index: number) =>
        (selectedCandidateIndexes ?? []).includes(index);

    const isDropped = (targetIndex: number) =>
        matchIndexes[targetIndex] !== undefined &&
        matchIndexes[targetIndex].length > 0;

    const isTargetCorrectlyMatched = (targetIndex: number) => {
        const matchedIndexes = matchIndexes[targetIndex] ?? [];
        const matchedCandidates = matchedIndexes.map((mi) => candidates[mi]);
        const targetMatches = matchTargets[targetIndex].props.matches;
        return difference(matchedCandidates, targetMatches).length === 0;
    };

    const getIndicateStatus = (targetIndex: number) => {
        if (!locked) {
            return undefined;
        }
        return isTargetCorrectlyMatched(targetIndex) ? 'correct' : 'incorrect';
    };

    const matchComponents = useMemo(() => {
        return randomOrder?.targets
            ? seededshuffle.shuffle(
                  [...matchTargets],
                  targetsRandomSeed.current,
              )
            : matchTargets;
    }, [matchTargets, randomOrder]);

    const [isDragging, setIsDragging] = useState(false);

    const [isComplete, setIsComplete] = useState(false);

    const handleDragStart = (e: DragStartEvent) => {
        setIsDragging(true);
    };

    const handleDragEnd = (e: DragEndEvent) => {
        setIsDragging(false);
        if (e.over && e.active) {
            handleDrop(Number(e.over.id), Number(e.active.id));
        }
    };

    return (
        <DndContext
            autoScroll={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {question && <QuestionContainer>{question}</QuestionContainer>}
            <Container direction={direction.sets ?? 'down'}>
                <CandidatesContainer
                    direction={direction.candidates ?? 'down'}
                    position={positions.candidates}
                >
                    {candidates.map((candidate, index) =>
                        !isCandidateSelected(index) ? (
                            <CandidateDraggable
                                key={index}
                                id={index}
                                enabled={true}
                                isComplete={isComplete}
                            >
                                {candidate}
                            </CandidateDraggable>
                        ) : null,
                    )}
                </CandidatesContainer>
                <TargetsContainer
                    position={positions.targets}
                    direction={direction.targets}
                >
                    {background && (
                        <BackgroundContainer>{background}</BackgroundContainer>
                    )}
                    {matchComponents.map((child) => {
                        const {
                            position,
                            styles: styleOverrides,
                        } = child.props;
                        const targetIndex = matchTargets.indexOf(child);
                        const styles = { ...targetStyles, ...styleOverrides };
                        return (
                            <TargetDroppable
                                id={targetIndex}
                                key={targetIndex}
                                isDragging={isDragging}
                                dropped={isDropped(targetIndex)}
                                indicateStatus={getIndicateStatus(targetIndex)}
                                position={position}
                                background={backgroundColor}
                                columns={columns}
                                styles={styles}
                            >
                                <TargetContainer
                                    direction={direction.matches ?? 'down'}
                                    isComplete={isComplete}
                                >
                                    {!direction.matches &&
                                    getSelectedCandidates(targetIndex)
                                        ? getSelectedCandidates(targetIndex)
                                        : [
                                              child,
                                              getSelectedCandidates(
                                                  targetIndex,
                                              ),
                                          ]}
                                </TargetContainer>
                            </TargetDroppable>
                        );
                    })}
                </TargetsContainer>
            </Container>
        </DndContext>
    );
};
