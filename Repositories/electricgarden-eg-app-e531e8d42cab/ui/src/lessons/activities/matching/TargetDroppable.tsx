import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styled, { css } from 'styled-components/macro';
import { Position } from './MatchTarget';

export type TargetDroppableProps = {
    id: number;
    position?: Position;
    dropped?: boolean;
    indicateStatus?: 'correct' | 'incorrect';
    children: React.ReactNode;
    isDragging: boolean;
    background?: string;
    columns?: number;
    styles?: {
        opacity?: number;
        border?: string;
        borderRadius?: string;
        background?: string;
        color?: string;
        width?: number;
        height?: number;
    };
};

const StyledDroppable = styled.div<
    Omit<TargetDroppableProps, 'id' | 'children'> & {
        isOver?: boolean;
    }
>`
    border-radius: 6px;
    background-color: ${({ isDragging, isOver }) =>
        isDragging ? (isOver ? 'deeppink' : 'lightgrey') : undefined};

    ${({ background }) =>
        background === 'grey' &&
        css`
            background: #e0e0e0;
        `}

    ${({ columns }) =>
        columns &&
        css`
            align-self: flex-start;
            min-width: max-content;
            --margin: 0.5em;
            margin: var(--margin);
            flex: 1 calc(${100 / columns}% - ${2 * columns} * var(--margin));
        `}

    ${({ isDragging, dropped }) =>
        isDragging
            ? dropped
                ? css`
                      opacity: 100%;
                  `
                : css`
                      opacity: 70%;
                      border: dotted 0.2px;
                  `
            : undefined}

    ${({ indicateStatus, dropped }) =>
        dropped &&
        indicateStatus === 'correct' &&
        css`
            --match-color ${({ theme }) => theme.trafficLights.green};
        `}
    ${({ indicateStatus, dropped }) =>
        dropped &&
        indicateStatus === 'incorrect' &&
        css`
            --match-color: ${({ theme }) => theme.trafficLights.red};
        `}

    ${({ position: p }) =>
        p
            ? css`
                  position: absolute;
                  ${p.top && `top: ${p.top}px`};
                  ${p.right && `right: ${p.right}px`};
                  ${p.bottom && `bottom: ${p.bottom}px`};
                  ${p.left && `left: ${p.left}px`};
              `
            : css`
                  margin: 0.5em;
              `}


  ${({ styles }) =>
        styles &&
        css`
            ${styles.opacity !== undefined && `opacity: ${styles.opacity}`};
            ${styles.border && `border: ${styles.border}`};
            ${styles.borderRadius !== undefined &&
            `border-radius: ${styles.borderRadius}`};
            ${styles.background && `background: ${styles.background}`};
            ${styles.color && `color: ${styles.color}`};
            ${styles.width && `width: ${styles.width}px`};
            ${styles.height && `height: ${styles.height}px`};
        `}
`;

export const TargetDroppable = ({
    id,
    children,
    ...styleProps
}: TargetDroppableProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: id.toString(),
    });

    return (
        <StyledDroppable ref={setNodeRef} isOver={isOver} {...styleProps}>
            {children}
        </StyledDroppable>
    );
};
