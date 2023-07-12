import React from 'react';

import { Activity } from '../activity';
import { Matching, MatchingProps } from './Matching';

export const MatchingActivity: React.FC<MatchingProps> = (props) => (
    <Activity>
        <Matching {...props} />
    </Activity>
);
