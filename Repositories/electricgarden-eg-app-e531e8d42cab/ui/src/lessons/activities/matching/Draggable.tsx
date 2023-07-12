import { useDraggable } from '@dnd-kit/core';
import React from 'react';
import styled from 'styled-components/macro';

export const StyledDraggable = styled.div<{
    $isDragging: boolean;
    $isComplete: boolean;
}>`
    margin: 0 0.25em;
    border-radius: 5px;
    display: flex;
    z-index: 1;
    cursor: ${({ $isDragging }) => ($isDragging ? `grabbing` : `grab`)};
    --box-shadow: ${({ $isDragging }) =>
        $isDragging ? '5px 5px 10px grey' : ''};
    --match-color: #ec008c;
    &:focus {
        outline: none;
    }
`;

type DraggableProps = {
    id: number;
    children: React.ReactNode;
    enabled: boolean;
    isComplete: boolean;
};

export const Draggable = (props: DraggableProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: props.id.toString(),
    });
    return (
        <StyledDraggable
            ref={setNodeRef}
            style={{
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
            }}
            $isDragging={isDragging}
            $isComplete={props.isComplete}
            {...listeners}
            {...attributes}
        >
            {props.children}
        </StyledDraggable>
    );
};
