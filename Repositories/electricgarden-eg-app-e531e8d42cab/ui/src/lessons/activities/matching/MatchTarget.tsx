import React from 'react';
import { TargetDroppableProps } from './TargetDroppable';

export type Position = {
    right?: number;
    top?: number;
    left?: number;
    bottom?: number;
};

export type MatchTargetProps = {
    matches: React.ReactElement<any>[];
    position?: Position;
    styles?: TargetDroppableProps['styles'];
};

// just strips off the targets props
export const MatchTarget: React.FC<MatchTargetProps> = ({ children }) => (
    <>{children}</>
);
