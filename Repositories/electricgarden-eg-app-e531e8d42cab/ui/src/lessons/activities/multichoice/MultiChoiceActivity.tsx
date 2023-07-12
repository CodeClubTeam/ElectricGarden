import React from 'react';

import { Activity } from '../activity';
import { ActivityProps } from '../activity/Activity';
import { MultiChoice, MultiChoiceProps } from './MultiChoice';

export const MultiChoiceActivity: React.FC<MultiChoiceProps & ActivityProps> = (
    props,
) => (
    <Activity>
        <MultiChoice {...props} />
    </Activity>
);
